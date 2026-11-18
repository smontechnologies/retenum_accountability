import { logger } from "../lib/logger";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export interface EmailSender {
  send(message: EmailMessage): Promise<void>;
}

/** Development: prints emails to the log (TD-14). */
export const consoleEmailSender: EmailSender = {
  async send(message) {
    logger.info("email (console adapter)", { to: message.to, subject: message.subject, text: message.text });
  },
};

/** Tests: captures emails in memory. */
export function createMemoryEmailSender() {
  const sent: EmailMessage[] = [];
  const sender: EmailSender & { sent: EmailMessage[]; failNext: number } = {
    sent,
    failNext: 0,
    async send(message) {
      if (sender.failNext > 0) {
        sender.failNext--;
        throw new Error("simulated email failure");
      }
      sent.push(message);
    },
  };
  return sender;
}
