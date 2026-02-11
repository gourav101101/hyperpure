import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiKey || !apiSecret || !cloudName) {
      console.error('Missing Cloudinary credentials:', { 
        hasApiKey: !!apiKey, 
        hasApiSecret: !!apiSecret, 
        hasCloudName: !!cloudName,
        env: process.env.NODE_ENV
      });
      return NextResponse.json(
        { 
          error: 'Cloudinary not configured',
          message: 'Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to Vercel environment variables',
          missing: {
            cloudName: !cloudName,
            apiKey: !apiKey,
            apiSecret: !apiSecret
          }
        },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          folder: 'hyperpure',
          resource_type: 'auto',
          transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({ url: (result as any).secure_url });
  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { 
        error: 'Upload failed', 
        detail: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Check if Cloudinary credentials are set in Vercel environment variables'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { publicId } = await req.json();
    
    if (!publicId) {
      return NextResponse.json({ error: 'No publicId provided' }, { status: 400 });
    }

    await cloudinary.uploader.destroy(publicId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
