export function validateFile(file: File, maxSize = 5242880, allowedTypes = ['image/jpeg', 'image/png', 'image/webp']): { valid: boolean; error?: string } {
  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB` };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }
  
  return { valid: true };
}

export async function compressImage(file: File, maxWidth = 1200): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * ratio;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => resolve(blob!), 'image/jpeg', 0.8);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
