import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'hyperpure' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({ url: (result as any).secure_url });
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
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