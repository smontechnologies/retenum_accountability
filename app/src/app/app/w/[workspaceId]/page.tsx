import { redirect } from "next/navigation";

/** Old Slice 1 URL: now lives at /app/business (UI/UX S15). */
export default async function LegacyWorkspacePage(props: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await props.params;
  redirect(`/app/business?ws=${encodeURIComponent(workspaceId)}`);
}
