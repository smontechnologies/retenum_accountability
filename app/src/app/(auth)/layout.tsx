import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <Link href="/" className="text-sm font-semibold">
        Retenum
      </Link>
      {children}
    </div>
  );
}
