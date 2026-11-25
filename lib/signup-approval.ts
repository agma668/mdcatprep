/**
 * Whether a new account still goes through the admin review queue.
 *
 * The approval system is NOT removed: `approveStudent` / `rejectStudent`,
 * `/pending`, `/rejected`, `/suspended` and the middleware gate all still
 * exist and still work. This switch only decides whether a fresh signup is
 * born `approved` or `pending`.
 *
 * The gate is paused for the free outreach period: requiring a human to
 * approve every account during a growth push costs signups for no revenue.
 * When paid access returns, set `SIGNUP_APPROVAL=manual` in the host
 * environment — no code change, no deploy — and every new account returns to
 * the review queue, including the "No email is sent" messaging.
 *
 * Only `pending` is ever promoted automatically. Rejected and suspended
 * accounts keep their state in both modes; an admin decision is never
 * overwritten by this flag.
 */
export type SignupApprovalMode = "auto" | "manual";

export const SIGNUP_APPROVAL_MODE: SignupApprovalMode =
  process.env.SIGNUP_APPROVAL === "manual" ? "manual" : "auto";

export const AUTO_APPROVE_SIGNUPS = SIGNUP_APPROVAL_MODE === "auto";

/** Copy shared by the signup page and the action, so both tell the same story. */
export const SIGNUP_SUCCESS_MESSAGE = AUTO_APPROVE_SIGNUPS
  ? "Signup successful. Your account is active — sign in and start practising. Free during beta."
  : "Signup successful. Your application is under review — once an admin approves it you can log in and start preparing. No email is sent; check your status by signing in.";
