import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = "CollabX <onboarding@resend.dev>";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** In dev, Resend only allows sending to the account owner's email.
 *  Set DEV_TEST_EMAIL in .env.local to redirect all outgoing emails there. */
export function resolveRecipient(actualEmail: string): string {
  const devEmail = process.env.DEV_TEST_EMAIL;
  return devEmail ? devEmail : actualEmail;
}
