"use client";
import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { login } from './authSlice';
import { addToCart, clearCart } from './cartSlice';
import { setSelectedLocation, setAvailableLocations, dismissLocationModal } from './locationSlice';
import { addToWishlist, clearWishlist, setWishlistHydrating } from './wishlistSlice';

export function ReduxPersist() {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const cart = useAppSelector((state) => state.cart);
  const location = useAppSelector((state) => state.location);
  const wishlist = useAppSelector((state) => state.wishlist);
  const [isClient, setIsClient] = useState(false);
  const wishlistIdsRef = useRef<string[]>([]);
  const wishlistHydratedRef = useRef(false);
  const cartSnapshotRef = useRef<Map<string, number>>(new Map());
  const cartHydratedRef = useRef(false);
  const normalizeId = (id: any) => String(id || '').split('-')[0];

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    setIsClient(true);
    
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userId = localStorage.getItem('userId');
    const userPhone = localStorage.getItem('userPhone');
    const userName = localStorage.getItem('userName');
    
    if (isLoggedIn && userId && userPhone) {
      dispatch(login({ userId, userPhone, userName: userName || 'Guest' }));
    }

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const items = JSON.parse(savedCart);
      dispatch(clearCart());
      items.forEach((item: any) => dispatch(addToCart(item)));
    }

    const savedLocation = localStorage.getItem('selectedLocation');
    if (savedLocation) {
      dispatch(setSelectedLocation(JSON.parse(savedLocation)));
    }

    const dismissed = localStorage.getItem('locationModalDismissed');
    if (dismissed === 'true') {
      dispatch(dismissLocationModal());
    }

    if (!isLoggedIn) {
      dispatch(setWishlistHydrating(false));
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        const items = JSON.parse(savedWishlist);
        dispatch(clearWishlist());
        items.forEach((item: any) => dispatch(addToWishlist(item)));
        wishlistIdsRef.current = items.map((item: any) => item._id);
      }
    }

    // Cart hydration from server happens in the dedicated cart effect below.
  }, [dispatch]);

  // Sync auth to localStorage (client-side only)
  useEffect(() => {
    if (!isClient) return;
    
    if (auth.isLoggedIn) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userId', auth.userId || '');
      localStorage.setItem('userPhone', auth.userPhone || '');
      localStorage.setItem('userName', auth.userName || 'Guest');
    } else {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userId');
      localStorage.removeItem('userPhone');
      localStorage.removeItem('userName');
    }
  }, [auth, isClient]);

  // Sync cart to localStorage (client-side only)
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('cart', JSON.stringify(cart.items));
  }, [cart.items, isClient]);

  // Load cart from server when logged in
  useEffect(() => {
    if (!isClient) return;
    const authId = auth.userId || auth.userPhone;
    if (!auth.isLoggedIn || !authId) {
      cartHydratedRef.current = true;
      cartSnapshotRef.current = new Map(cart.items.map((item) => [item._id, item.quantity]));
      return;
    }

    cartHydratedRef.current = false;

    const loadCart = async () => {
      try {
        const res = await fetch(`/api/cart?userId=${encodeURIComponent(authId)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const serverItems = Array.isArray(data?.cart) ? data.cart : [];
          const savedCart = localStorage.getItem('cart');
          const localItems = savedCart ? JSON.parse(savedCart) : [];

          const mergedMap = new Map<string, any>();
          const localAgg = new Map<string, any>();
          localItems.forEach((item: any) => {
            const key = normalizeId(item._id);
            const existing = localAgg.get(key);
            if (existing) {
              localAgg.set(key, { ...existing, quantity: (existing.quantity || 0) + (item.quantity || 0) });
            } else {
              localAgg.set(key, { ...item, _id: key });
            }
          });
          // Prefer server quantities; only add local-only items.
          serverItems.forEach((item: any) => {
            const key = normalizeId(item._id);
            mergedMap.set(key, { ...item, _id: key });
          });
          localAgg.forEach((item, key) => {
            if (!mergedMap.has(key)) {
              mergedMap.set(key, item);
            }
          });
          const mergedItems = Array.from(mergedMap.values());

          dispatch(clearCart());
          mergedItems.forEach((item: any) => dispatch(addToCart(item)));
          localStorage.setItem('cart', JSON.stringify(mergedItems));

          // Persist merged cart to server only if local had items not on server
          const serverIds = new Set(serverItems.map((s: any) => normalizeId(s._id)));
          const hasLocalOnly = localItems.some((item: any) => !serverIds.has(normalizeId(item._id)));
          if (hasLocalOnly) {
            await fetch('/api/cart', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: authId,
                items: mergedItems.map((item: any) => ({
                  productId: normalizeId(item._id),
                  quantity: item.quantity || 1,
                })),
              }),
            });
          }

          cartSnapshotRef.current = new Map(mergedItems.map((item: any) => [normalizeId(item._id), item.quantity]));
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
      } finally {
        cartHydratedRef.current = true;
      }
    };

    loadCart();
  }, [auth.isLoggedIn, auth.userId, auth.userPhone, dispatch, isClient]);

  // Sync cart changes to server for logged-in users
  useEffect(() => {
    if (!isClient) return;
    const authId = auth.userId || auth.userPhone;
    if (!auth.isLoggedIn || !authId) return;
    if (!cartHydratedRef.current) return;

    const prev = cartSnapshotRef.current;
    const next = new Map(
      cart.items.map((item) => [normalizeId(item._id), item.quantity])
    );

    const added: Array<{ id: string; quantity: number }> = [];
    const updated: Array<{ id: string; quantity: number }> = [];
    const removed: string[] = [];

    next.forEach((qty, id) => {
      if (!prev.has(id)) {
        added.push({ id, quantity: qty });
      } else if (prev.get(id) !== qty) {
        updated.push({ id, quantity: qty });
      }
    });

    prev.forEach((_, id) => {
      if (!next.has(id)) removed.push(id);
    });

    if (added.length === 0 && updated.length === 0 && removed.length === 0) return;

    cartSnapshotRef.current = next;

    const sync = async () => {
      try {
        for (const item of added) {
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: authId, productId: item.id, quantity: item.quantity }),
          });
        }
        for (const item of updated) {
          await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: authId, productId: item.id, quantity: item.quantity }),
          });
        }
        for (const id of removed) {
          await fetch('/api/cart', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: authId, productId: id }),
          });
        }
      } catch (error) {
        console.error('Failed to sync cart:', error);
      }
    };

    sync();
  }, [auth.isLoggedIn, auth.userId, auth.userPhone, isClient, cart.items]);

  // Sync location to localStorage (client-side only)
  useEffect(() => {
    if (!isClient) return;
    
    if (location.selectedLocation) {
      localStorage.setItem('selectedLocation', JSON.stringify(location.selectedLocation));
    } else {
      localStorage.removeItem('selectedLocation');
    }
  }, [location.selectedLocation, isClient]);

  useEffect(() => {
    if (!isClient) return;
    
    if (location.locationModalDismissed) {
      localStorage.setItem('locationModalDismissed', 'true');
    } else {
      localStorage.removeItem('locationModalDismissed');
    }
  }, [location.locationModalDismissed, isClient]);

  // Sync wishlist to localStorage (client-side only)
  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem('wishlist', JSON.stringify(wishlist.items));
  }, [wishlist.items, isClient]);

  // Load wishlist from server when logged in
  useEffect(() => {
    if (!isClient) return;
    const authId = auth.userId || auth.userPhone;
    if (!auth.isLoggedIn || !authId) {
      dispatch(setWishlistHydrating(false));
      wishlistHydratedRef.current = true;
      wishlistIdsRef.current = wishlist.items.map((item) => item._id);
      return;
    }

    wishlistHydratedRef.current = false;
    dispatch(setWishlistHydrating(true));

    const loadWishlist = async () => {
      try {
        const res = await fetch(`/api/wishlist?userId=${encodeURIComponent(authId)}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const serverItems = Array.isArray(data?.wishlist) ? data.wishlist : [];
          const savedWishlist = localStorage.getItem('wishlist');
          const localItems = savedWishlist ? JSON.parse(savedWishlist) : [];

          const mergedMap = new Map<string, any>();
          // Prefer server data when the same item exists locally.
          localItems.forEach((item: any) => mergedMap.set(item._id, item));
          serverItems.forEach((item: any) => mergedMap.set(item._id, item));
          const mergedItems = Array.from(mergedMap.values());

          wishlistIdsRef.current = serverItems.map((item: any) => item._id);
          dispatch(clearWishlist());
          mergedItems.forEach((item: any) => dispatch(addToWishlist(item)));
          localStorage.setItem('wishlist', JSON.stringify(mergedItems));
        }
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      } finally {
        wishlistHydratedRef.current = true;
        dispatch(setWishlistHydrating(false));
      }
    };

    loadWishlist();
  }, [auth.isLoggedIn, auth.userId, auth.userPhone, dispatch, isClient]);

  // Sync wishlist changes to server for logged-in users
  useEffect(() => {
    if (!isClient) return;
    const authId = auth.userId || auth.userPhone;
    if (!auth.isLoggedIn || !authId) return;
    if (!wishlistHydratedRef.current) return;

    const prevIds = new Set(wishlistIdsRef.current);
    const nextIds = new Set(wishlist.items.map((item) => item._id));

    const added = wishlist.items.filter((item) => !prevIds.has(item._id));
    const removed = wishlistIdsRef.current.filter((id) => !nextIds.has(id));

    if (added.length === 0 && removed.length === 0) return;

    wishlistIdsRef.current = wishlist.items.map((item) => item._id);

    const sync = async () => {
      try {
        for (const item of added) {
          await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: authId, productId: item._id }),
          });
        }
        for (const productId of removed) {
          await fetch('/api/wishlist', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: authId, productId }),
          });
        }
      } catch (error) {
        console.error('Failed to sync wishlist:', error);
      }
    };

    sync();
  }, [auth.isLoggedIn, auth.userId, auth.userPhone, isClient, wishlist.items]);

  return null;
}
