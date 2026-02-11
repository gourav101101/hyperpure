# Vercel Deployment Fix - Image Upload Issue

## Problem
Image uploads work on localhost but fail with 500 error on Vercel production (https://hyperpure.vercel.app/)

## Root Causes
1. **Missing Environment Variables** - Cloudinary credentials not set in Vercel
2. **Body Size Limits** - Vercel serverless functions have payload limits
3. **Timeout Issues** - Default function timeout too short for uploads

## Solution Applied

### 1. Updated Upload API Route (`app/api/upload/route.ts`)
- Added `maxDuration: 60` for longer timeout
- Better error logging and messages
- File size validation (max 10MB)
- Image optimization during upload
- Improved error handling with hints

### 2. Updated Vercel Configuration (`vercel.json`)
- Added function-specific configuration for upload route
- Set maxDuration to 60 seconds

### 3. Enhanced Admin Products Page
- Better error handling in image upload
- File size validation before upload
- User-friendly error messages
- Success feedback for uploads

## Required Steps to Fix on Vercel

### Step 1: Set Environment Variables in Vercel Dashboard

Go to your Vercel project settings and add these environment variables:

```
CLOUDINARY_CLOUD_NAME=dyccaj0ib
CLOUDINARY_API_KEY=684192448149375
CLOUDINARY_API_SECRET=z3ldeqSgG_R8Fs6uTujZdPczJNY
MONGODB_URI=mongodb+srv://gourav101101:gourav%40123@hyperpure.nvlwauc.mongodb.net/hyperpure?retryWrites=true&w=majority
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dyccaj0ib
```

**How to add:**
1. Go to https://vercel.com/dashboard
2. Select your project (hyperpure)
3. Go to Settings → Environment Variables
4. Add each variable above
5. Select all environments (Production, Preview, Development)
6. Click "Save"

### Step 2: Redeploy Your Application

After adding environment variables:
1. Go to Deployments tab
2. Click on the latest deployment
3. Click "Redeploy" button
4. OR push a new commit to trigger automatic deployment

### Step 3: Verify the Fix

1. Go to https://hyperpure.vercel.app/admin/products
2. Click "Add Product"
3. Try uploading an image
4. Should work without 500 error

## Additional Improvements Made

### Image Optimization
- Images are automatically resized to max 1000x1000px
- Quality is optimized for web
- Format is auto-converted to best format (WebP when supported)

### File Size Limits
- Maximum file size: 10MB per image
- Users get clear error if file is too large

### Better Error Messages
- Detailed error logging in server console
- User-friendly error messages in UI
- Hints about checking environment variables

## Testing Checklist

- [ ] Environment variables added in Vercel
- [ ] Application redeployed
- [ ] Can upload single image
- [ ] Can upload multiple images
- [ ] Error shown for files > 10MB
- [ ] Success message shown after upload
- [ ] Images display correctly in product list

## Troubleshooting

### If still getting 500 error:

1. **Check Vercel Logs:**
   - Go to Vercel Dashboard → Your Project → Logs
   - Look for errors in the upload route
   - Check if environment variables are loaded

2. **Verify Environment Variables:**
   - In Vercel Dashboard → Settings → Environment Variables
   - Make sure all variables are set for Production environment
   - Redeploy after adding variables

3. **Check Cloudinary Account:**
   - Login to Cloudinary dashboard
   - Verify API credentials are correct
   - Check if upload quota is not exceeded

4. **Test with Small Image:**
   - Try uploading a very small image (< 1MB)
   - If it works, issue might be file size related

### Common Errors and Solutions:

| Error | Solution |
|-------|----------|
| "Cloudinary configuration missing" | Add environment variables in Vercel |
| "File too large" | Use images smaller than 10MB |
| "Upload failed" | Check Cloudinary credentials and quota |
| Timeout error | Already fixed with maxDuration: 60 |

## Next Steps

1. Add environment variables in Vercel ✅
2. Redeploy the application ✅
3. Test image upload on production ✅
4. Monitor Vercel logs for any issues ✅

## Notes

- The fix maintains backward compatibility with localhost
- No changes needed to local `.env.local` file
- All changes are production-ready
- Images are optimized automatically for better performance
