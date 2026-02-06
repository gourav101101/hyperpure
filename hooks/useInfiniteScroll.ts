'use client';

import { useEffect, useRef, useState } from 'react';

export function useInfiniteScroll(callback: () => void, hasMore: boolean) {
  const [isFetching, setIsFetching] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || isFetching) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsFetching(true);
          callback();
          setTimeout(() => setIsFetching(false), 1000);
        }
      },
      { threshold: 0.1 }
    );

    if (targetRef.current) {
      observerRef.current.observe(targetRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, isFetching, callback]);

  return { targetRef, isFetching };
}
