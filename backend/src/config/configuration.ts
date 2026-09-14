/**
 * Central place that turns raw process.env strings into a typed,
 * structured config object. Inject `ConfigService` and read via
 * `configService.get('mongodb.uri', { infer: true })` etc.
 */
export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongodb: {
    uri: process.env.MONGODB_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
});
