import { Banknote, Bell, CheckCheck, Cog, HandCoins, Package, Zap, type LucideIcon } from "lucide-react";
import type { Category } from "@/domain/workflow";

export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  Deliver: Package,
  Pay: Banknote,
  Provide: HandCoins,
  Approve: CheckCheck,
  Notify: Bell,
  Control: Cog,
};
export const TriggerIcon = Zap;
