import type { ReactNode } from "react";

/** Full-screen flows outside the shell tabs (e.g. Winter Arc setup, MASTER_DOC §13). */
export default function FullscreenLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col gap-6 px-4 py-10 sm:px-6">
      {children}
    </main>
  );
}
