import { getDb } from "@/server/db/client";
import { requireActor } from "@/server/auth/session";
import { getUserTheme } from "@/server/modules/preferences/theme";
import { ButtonLink } from "@/components/ui/button";
import { DescriptionList } from "@/components/ui/description-list";
import { PageHeader, Panel } from "@/components/ui/panel";
import { ThemeSelect } from "@/components/ui/theme-select";
import { user } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const actor = await requireActor("/app/settings");
  const db = getDb();
  const [theme, [me]] = await Promise.all([getUserTheme(db, actor.userId), db.select({ name: user.name }).from(user).where(eq(user.id, actor.userId)).limit(1)]);
  return (
    <div className="space-y-8">
      <PageHeader title="Settings" description="Your personal account. Workspace settings are under Business." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Profile">
          <DescriptionList items={[{ label: "Name", value: me?.name ?? "" }, { label: "Email", value: actor.email }]} />
        </Panel>
        <Panel title="Appearance" description="Applies on every device you sign in to.">
          <ThemeSelect current={theme} />
        </Panel>
        <Panel title="Security">
          <p className="mb-4 text-small text-fg-secondary">To change your password, we'll email you a reset link.</p>
          <ButtonLink href="/forgot-password" variant="secondary" size="sm">Change password</ButtonLink>
        </Panel>
      </div>
    </div>
  );
}
