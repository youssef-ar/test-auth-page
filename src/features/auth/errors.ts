export type AuthErrorKey =
  | "invalidCredentials"
  | "emailTaken"
  | "invalidCode"
  | "invalidRecoveryCode"
  | "codeAttemptsExceeded"
  | "accountLocked"
  | "sessionExpired"
  | "invalidToken"
  | "tooManyRequests"
  | "unknown";

const KEYS_BY_CODE: Record<string, AuthErrorKey> = {
  INVALID_EMAIL_OR_PASSWORD: "invalidCredentials",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "emailTaken",
  INVALID_CODE: "invalidCode",
  INVALID_BACKUP_CODE: "invalidRecoveryCode",
  OTP_HAS_EXPIRED: "invalidCode",
  TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE: "codeAttemptsExceeded",
  ACCOUNT_TEMPORARILY_LOCKED: "accountLocked",
  INVALID_TWO_FACTOR_COOKIE: "sessionExpired",
  INVALID_TOKEN: "invalidToken",
};

export class AuthRequestError extends Error {
  constructor(
    readonly key: AuthErrorKey,
    readonly retryAfter?: number,
  ) {
    super(key);
    this.name = "AuthRequestError";
  }
}

type BetterAuthError = { status?: number; code?: string; message?: string };

export const toAuthRequestError = (error: BetterAuthError, retryAfterHeader?: string | null) => {
  if (error.status === 429) {
    const seconds = Number(retryAfterHeader);
    return new AuthRequestError("tooManyRequests", Number.isFinite(seconds) && seconds > 0 ? seconds : undefined);
  }
  return new AuthRequestError((error.code && KEYS_BY_CODE[error.code]) || "unknown");
};

// Better Auth returns `{ data, error }` and keeps the 429 header on the raw response only.
export const callAuth = async <T>(
  request: (fetchOptions: { onError: (context: { response: Response }) => void }) => Promise<{
    data: T | null;
    error: BetterAuthError | null;
  }>,
): Promise<T> => {
  let retryAfter: string | null = null;
  const result = await request({
    onError: ({ response }) => {
      retryAfter = response.headers.get("X-Retry-After");
    },
  });
  if (result.error) throw toAuthRequestError(result.error, retryAfter);
  return result.data as T;
};
