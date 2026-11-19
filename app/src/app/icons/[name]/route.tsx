import { ImageResponse } from "next/og";
import { Mark } from "../mark";

const ICONS: Record<string, { size: number; padding: number }> = {
  "icon-192.png": { size: 192, padding: 0 },
  "icon-512.png": { size: 512, padding: 0 },
  "maskable-512.png": { size: 512, padding: 96 }, // keeps the mark inside the 80% safe zone
};

export const dynamic = "force-static";
export function generateStaticParams() {
  return Object.keys(ICONS).map((name) => ({ name }));
}

/** PWA icons generated at build time (PWA-01). */
export async function GET(_req: Request, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const icon = ICONS[name];
  if (!icon) return new Response("Not found", { status: 404 });
  return new ImageResponse(<Mark size={icon.size} padding={icon.padding} />, { width: icon.size, height: icon.size });
}
