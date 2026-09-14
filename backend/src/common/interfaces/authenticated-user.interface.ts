/**
 * Shape of the user object attached to `req.user` after the JWT guard
 * runs. Deliberately excludes passwordHash — it is never loaded into
 * this object in the first place (see JwtStrategy.validate).
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
}
