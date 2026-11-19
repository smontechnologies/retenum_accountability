/**
 * The icon set used by the design system (Lucide, design system §5). Importing individually keeps
 * the bundle small; StatusBadge resolves icons by name from this map.
 */
import {
  AlarmClock, ArrowLeftRight, BadgeCheck, Calendar, Check, CheckCheck, CircleAlert, CircleDashed, CircleDot,
  CirclePlay, Clock, FilePen, Flag, Inbox, KeyRound, Loader, Lock, LockOpen, OctagonPause, RefreshCcw,
  RotateCcw, Scale, Send, TimerOff, Undo, Undo2, X, type LucideIcon,
} from "lucide-react";

export const STATUS_ICONS: Record<string, LucideIcon> = {
  AlarmClock, ArrowLeftRight, BadgeCheck, Calendar, Check, CheckCheck, CircleAlert, CircleDashed, CircleDot,
  CirclePlay, Clock, FilePen, Flag, Inbox, KeyRound, Loader, Lock, LockOpen, OctagonPause, RefreshCcw,
  RotateCcw, Scale, Send, TimerOff, Undo, Undo2, X,
};
