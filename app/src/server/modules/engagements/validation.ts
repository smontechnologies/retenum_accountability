import { z } from "zod";

const text = (max: number) => z.string().trim().min(1, "Required").max(max);
const optional = (max: number) => z.string().trim().max(max).optional().transform((v) => (v ? v : undefined));
const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address"));
const isoDate = z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date").optional().or(z.literal("").transform(() => undefined));

export const CreateDraftInput = z.object({
  workspaceId: z.uuid(),
  title: text(140),
  description: optional(2000),
  initiatorSide: z.enum(["payee", "payer"], { message: "Choose your role in this engagement" }),
  counterpartyOrg: text(140),
  counterpartyName: text(100),
  counterpartyEmail: email,
});

export const DeliverableInput = z.object({
  title: text(200),
  description: optional(2000),
  quantity: z.string().trim().regex(/^\d+(\.\d{1,3})?$/, "Use a number, e.g. 3 or 14.5").optional().or(z.literal("").transform(() => undefined)),
  unit: optional(30),
  definitionOfDone: optional(2000),
  dueDate: isoDate,
  exclusions: optional(1000),
  price: z.string().trim().min(1, "Enter a price (0 if included at no extra cost)"),
});

export const PartyObligationInput = z.object({
  owedBySide: z.enum(["payer", "payee"]),
  title: text(200),
  description: optional(2000),
  dueDate: isoDate,
});

export const PaymentObligationInput = z.object({
  title: text(200),
  amount: z.string().trim().min(1, "Enter an amount"),
  trigger: z.enum(["on_confirmation", "on_date", "on_acceptance", "on_request"], { message: "Choose when it becomes due" }),
  triggerDate: isoDate,
  termsDays: z.coerce.number().int().min(0, "Use 0 or more days").max(365, "Use at most 365 days").optional(),
  linkedCommitmentId: z.string().optional().transform((v) => (v ? v : undefined)),
});

export const ResponseWindowsInput = z.object({
  baseline: z.coerce.number().int().min(1, "At least 1 working day").max(30, "At most 30 working days"),
  changes: z.coerce.number().int().min(1, "At least 1 working day").max(30, "At most 30 working days"),
  deliveries: z.coerce.number().int().min(1, "At least 1 working day").max(30, "At most 30 working days"),
  paymentConfirmations: z.coerce.number().int().min(1, "At least 1 working day").max(30, "At most 30 working days"),
});

export const BaselineResponseInput = z.discriminatedUnion("response", [
  z.object({ response: z.literal("confirm"), submissionId: z.uuid(), acknowledged: z.literal("yes", { message: "Tick the confirmation to continue" }) }),
  z.object({ response: z.literal("request_changes"), submissionId: z.uuid(), comment: text(2000) }),
  z.object({ response: z.literal("decline"), submissionId: z.uuid(), comment: text(2000) }),
]);
