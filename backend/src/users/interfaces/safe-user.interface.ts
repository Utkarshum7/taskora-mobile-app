/**
 * The only shape of a user that is ever allowed to leave the API.
 * passwordHash is intentionally not a field here.
 */
export interface SafeUser {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}
