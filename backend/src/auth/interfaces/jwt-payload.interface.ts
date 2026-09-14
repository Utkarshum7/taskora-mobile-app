/** Shape of the data encoded inside our JWTs. `sub` is the standard JWT claim for subject/user id. */
export interface JwtPayload {
  sub: string;
  email: string;
}
