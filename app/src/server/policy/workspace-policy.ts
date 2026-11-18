/**
 * Workspace authorisation (TD-06, PRD §17, deny by default). Engagement-level policy arrives in Slice 2.
 */
export type WorkspaceRole = "owner" | "admin" | "member";
export type WorkspaceAction =
  | "workspace.view"
  | "workspace.update"
  | "workspace.invite"
  | "workspace.revoke_invitation"
  | "workspace.change_role"
  | "workspace.remove_member"
  | "workspace.transfer_ownership";

const MATRIX: Record<WorkspaceAction, readonly WorkspaceRole[]> = {
  "workspace.view": ["owner", "admin", "member"],
  "workspace.update": ["owner", "admin"],
  "workspace.invite": ["owner", "admin"],
  "workspace.revoke_invitation": ["owner", "admin"],
  "workspace.change_role": ["owner", "admin"],
  "workspace.remove_member": ["owner", "admin"],
  "workspace.transfer_ownership": ["owner"],
};

export const WORKSPACE_ACTIONS = Object.keys(MATRIX) as WorkspaceAction[];

export function canInWorkspace(role: WorkspaceRole | null | undefined, action: WorkspaceAction): boolean {
  if (!role) return false;
  return MATRIX[action].includes(role);
}
