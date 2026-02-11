# 🚀 QUICK FIX - Vercel Upload Error

## ⚡ Immediate Action Required

### 1️⃣ Add Environment Variables in Vercel (2 minutes)

**Go to:** https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Add these 5 variables:**

```
CLOUDINARY_CLOUD_NAME = <CLOUD_NAME>
CLOUDINARY_API_KEY = <API_KEY>
CLOUDINARY_API_SECRET = <API_SECRET>
MONGODB_URI = <MONGODB_URI>
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = <CLOUD_NAME>
```

✅ Select: Production, Preview, Development (all three)

### 2️⃣ Redeploy (1 minute)

**Option A:** Push this commit to GitHub (auto-deploys)
```bash
git add .
git commit -m "fix: Vercel image upload with env vars and timeout"
git push
```

**Option B:** Manual redeploy in Vercel Dashboard
- Go to Deployments tab
- Click latest deployment → Redeploy

### 3️⃣ Test (30 seconds)

1. Go to https://hyperpure.vercel.app/admin/products
2. Click "Add Product"
3. Upload an image
4. ✅ Should work!

---

## 🔧 What Was Fixed

✅ Added environment variable validation  
✅ Increased function timeout to 60 seconds  
✅ Added file size limit (10MB)  
✅ Better error messages  
✅ Image optimization  
✅ Proper error handling  

## 📝 Files Changed

- `app/api/upload/route.ts` - Better error handling & timeout
- `vercel.json` - Function configuration
- `app/admin/products/page.tsx` - Better upload error handling

---

**That's it! The code is fixed. Just add the environment variables in Vercel and redeploy.**
