import { z } from "zod";

const trimmed = (max: number) => z.string().trim().min(1, "Required").max(max);
const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email address")).pipe(z.string().max(254));

export const CreateWorkspaceInput = z.object({
  name: trimmed(120),
  type: z.enum(["business", "individual"]),
  registrationNumber: z.string().trim().max(50).optional().transform((v) => v || undefined),
  address: z.string().trim().max(300).optional().transform((v) => v || undefined),
  contactEmail: email,
});
export type CreateWorkspaceInput = z.input<typeof CreateWorkspaceInput>;

export const InviteMemberInput = z.object({
  workspaceId: z.uuid(),
  email,
  role: z.enum(["admin", "member"]),
});

export const ChangeRoleInput = z.object({
  workspaceId: z.uuid(),
  memberUserId: z.string().min(1),
  role: z.enum(["admin", "member"]),
});

export const MemberRefInput = z.object({ workspaceId: z.uuid(), memberUserId: z.string().min(1) });
export const TransferOwnershipInput = z.object({ workspaceId: z.uuid(), newOwnerUserId: z.string().min(1) });
