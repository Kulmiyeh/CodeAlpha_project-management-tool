import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  mongoUri: required('MONGODB_URI', 'mongodb://localhost:27017/pm-tool'),
  mongoDbName: process.env.MONGODB_DB ?? 'pm-tool',
  jwtSecret: required('JWT_SECRET', 'dev-secret-change-me'),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
};
