const requiredEnvVars = [
  'MONGODB_URI',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
];

export function validateEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
