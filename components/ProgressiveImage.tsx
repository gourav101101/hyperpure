'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function ProgressiveImage({ src, alt, width, height, className = '' }: { src: string; alt: string; width: number; height: number; className?: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!loaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        onLoad={() => setLoaded(true)}
        className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
