export function shouldCompress(contentType: string): boolean {
  const compressible = [
    'text/',
    'application/json',
    'application/javascript',
    'application/xml',
  ];
  return compressible.some(type => contentType.includes(type));
}

export function getCompressionHeaders() {
  return {
    'Content-Encoding': 'gzip',
    'Vary': 'Accept-Encoding',
  };
}
