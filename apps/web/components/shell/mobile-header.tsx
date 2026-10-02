"use client";

import { Button } from "@b-core/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@b-core/ui/components/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import { SidebarNav } from "./sidebar-nav";
import { Wordmark } from "./wordmark";

/** Top bar below lg: wordmark + menu that opens the full navigation. */
export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line bg-bg/90 px-1 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden">
      <Wordmark />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Open menu">
            <Menu className="size-5" aria-hidden="true" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-sidebar max-w-[85vw] gap-3 bg-panel px-4 py-7">
          <SheetTitle className="px-3 text-xl font-extrabold tracking-[0.15em]">B-CORE</SheetTitle>
          <SheetDescription className="sr-only">Navigate between B-Core sections</SheetDescription>
          <SidebarNav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </header>
  );
}
