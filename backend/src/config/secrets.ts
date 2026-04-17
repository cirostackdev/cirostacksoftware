interface SecretsCache {
  postgresUrl: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
  muxTokenId: string;
  muxTokenSecret: string;
  paystackSecretKey: string;
  paystackWebhookSecret: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  awsAccessKey: string;
  awsSecretKey: string;
  awsS3Bucket: string;
  awsRegion: string;
  pistonApiUrl: string;
  armoryUrl: string;
  armoryInternalKey: string;
}

let cache: SecretsCache | null = null;

// Maps secret name → env var name
const ENV_MAP: Record<keyof SecretsCache, string> = {
  postgresUrl: 'POSTGRES_URL',
  jwtAccessSecret: 'JWT_ACCESS_SECRET',
  jwtRefreshSecret: 'JWT_REFRESH_SECRET',
  muxTokenId: 'MUX_TOKEN_ID',
  muxTokenSecret: 'MUX_TOKEN_SECRET',
  paystackSecretKey: 'PAYSTACK_SECRET_KEY',
  paystackWebhookSecret: 'PAYSTACK_WEBHOOK_SECRET',
  stripeSecretKey: 'STRIPE_SECRET_KEY',
  stripeWebhookSecret: 'STRIPE_WEBHOOK_SECRET',
  awsAccessKey: 'AWS_ACCESS_KEY',
  awsSecretKey: 'AWS_SECRET_KEY',
  awsS3Bucket: 'AWS_S3_BUCKET',
  awsRegion: 'AWS_REGION',
  pistonApiUrl: 'PISTON_API_URL',
  armoryUrl: 'ARMORY_URL',
  armoryInternalKey: 'ARMORY_INTERNAL_KEY',
};

// Broker path for each secret (used in production)
const BROKER_PATH_MAP: Record<keyof SecretsCache, string> = {
  postgresUrl: 'postgres-url',
  jwtAccessSecret: 'jwt-access-secret',
  jwtRefreshSecret: 'jwt-refresh-secret',
  muxTokenId: 'mux-token-id',
  muxTokenSecret: 'mux-token-secret',
  paystackSecretKey: 'paystack-secret-key',
  paystackWebhookSecret: 'paystack-webhook-secret',
  stripeSecretKey: 'stripe-secret-key',
  stripeWebhookSecret: 'stripe-webhook-secret',
  awsAccessKey: 'aws-access-key',
  awsSecretKey: 'aws-secret-key',
  awsS3Bucket: 'aws-s3-bucket',
  awsRegion: 'aws-region',
  pistonApiUrl: 'piston-api-url',
  armoryUrl: 'armory-url',
  armoryInternalKey: 'armory-internal-key',
};

async function fetchFromBroker(brokerUrl: string, path: string): Promise<string> {
  const res = await fetch(`${brokerUrl}/v1/secret/cirostack/academy/${path}`, {
    headers: { 'X-Vault-Token': process.env.BROKER_TOKEN ?? '' },
  });
  if (!res.ok) throw new Error(`Broker ${res.status} for ${path}`);
  const body = (await res.json()) as { data?: { value?: string } };
  const value = body?.data?.value;
  if (!value) throw new Error(`Secret ${path} is empty`);
  return value;
}

export async function loadSecrets(): Promise<void> {
  const isProd = process.env.NODE_ENV === 'production';
  const brokerUrl = process.env.BROKER_URL;
  const useBroker = isProd && !!brokerUrl;

  const partial: Partial<SecretsCache> = {};

  for (const [key, envVar] of Object.entries(ENV_MAP) as [keyof SecretsCache, string][]) {
    // 1. Try env var first (works for both .env in dev and injected vars in prod)
    const envVal = process.env[envVar];
    if (envVal) {
      partial[key] = envVal;
      continue;
    }

    // 2. Try Broker in production
    if (useBroker) {
      try {
        partial[key] = await fetchFromBroker(brokerUrl!, BROKER_PATH_MAP[key]);
        continue;
      } catch (err) {
        throw new Error(`[secrets] FATAL: could not load ${key} from Broker: ${String(err)}`);
      }
    }

    // 3. Dev fallback — warn but don't crash
    console.warn(`[secrets] ${envVar} not set — some features may not work`);
    partial[key] = '';
  }

  cache = partial as SecretsCache;
  console.log('[secrets] loaded');
}

export function secrets(): SecretsCache {
  if (!cache) throw new Error('[secrets] loadSecrets() not called yet');
  return cache;
}
