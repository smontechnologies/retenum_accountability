/** The authenticated person performing an action. Built from the session in the web layer. */
export interface Actor {
  userId: string;
  email: string;
  emailVerified: boolean;
}
