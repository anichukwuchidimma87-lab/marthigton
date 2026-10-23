export function getRuntimeConfiguration(env = process.env, databaseState = 0) {
  const clientOrigins = (env.CLIENT_ORIGINS || "http://localhost:1234")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
  const configuredPort = Number(env.PORT);

  return {
    database: {
      configured: Boolean(env.MONGODB_URI),
      connected: databaseState === 1,
    },
    jwtSecret: {
      configured: Boolean(env.JWT_SECRET),
      meetsMinimumLength: Boolean(env.JWT_SECRET && env.JWT_SECRET.length >= 32),
    },
    clientOrigins: {
      configured: Boolean(env.CLIENT_ORIGINS),
      count: clientOrigins.length,
    },
    port: {
      configured: Boolean(env.PORT),
      value: Number.isInteger(configuredPort) && configuredPort > 0 ? configuredPort : 5000,
    },
    nodeEnvironment: env.NODE_ENV || "development",
  };
}
