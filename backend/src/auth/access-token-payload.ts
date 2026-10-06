/**
 * Content of a login token once verified, as AuthGuard puts it on `request.user`.
 * Signed in AuthService.signIn and ImpersonationService (under impersonation,
 * `sub` is the impersonated user).
 */
export interface AccessTokenPayload {
  /** The user's id. */
  sub: number;
  /** The user's name. */
  user: string;
  isEmailConfirmed: boolean;
  /** A date on the user record; text once it has travelled in a token. */
  termsValidatedAt: string | null;
}
