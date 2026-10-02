"use client";

import { Button } from "@b-core/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@b-core/ui/components/dialog";
import { useState } from "react";

type Props = { label?: string; onConfirm: () => Promise<void> };

/** Abandon the active arc (E15): confirmation with consequences. */
export function AbandonArcDialog({ label = "Abandon arc", onConfirm }: Props) {
  const [busy, setBusy] = useState(false);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ember">{label}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Abandon this arc?</DialogTitle>
          <DialogDescription>
            Your logs and reports so far are kept as a read-only past arc. There will be no final
            arc report, and the streak ends here. This can&apos;t be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Keep my arc</Button>
          </DialogClose>
          <Button
            variant="ember"
            disabled={busy}
            onClick={() => {
              setBusy(true);
              void onConfirm().finally(() => setBusy(false));
            }}
          >
            Abandon arc
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
