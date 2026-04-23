import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

function extractUriDbName(uri: string): string | undefined {
  try {
    const afterScheme = uri.replace(/^mongodb(\+srv)?:\/\//, '');
    const afterAuth = afterScheme.includes('@') ? afterScheme.slice(afterScheme.indexOf('@') + 1) : afterScheme;
    const [hostAndPath] = afterAuth.split('?');
    const slashIdx = hostAndPath.indexOf('/');
    if (slashIdx === -1) return undefined;
    const path = hostAndPath.slice(slashIdx + 1);
    return path || undefined;
  } catch {
    return undefined;
  }
}

const mongoUri = required('MONGODB_URI', 'mongodb://localhost:27017/pm-tool');
const explicitDbName = process.env.MONGODB_DB?.trim() || undefined;

export const env = {
  port: parseInt(process.env.PORT ?? '4000', 10),
  mongoUri,
  // Priority: explicit MONGODB_DB env var > db name encoded in MONGODB_URI path > 'pm-tool' fallback
  // When undefined the mongoose dbName option is omitted, preserving whatever the URI encodes.
  mongoDbName: explicitDbName ?? (extractUriDbName(mongoUri) ? undefined : 'pm-tool'),
  jwtSecret: required('JWT_SECRET', 'dev-secret-change-me'),
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:5173',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
};
