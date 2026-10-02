"use client";

import { cn } from "@b-core/ui/lib/cn";
import { useRef, useState } from "react";

const HOLD_MS = 1500;

type HoldButtonProps = {
  /** When true a normal tap/click triggers (name typed). Otherwise press and hold. */
  armed: boolean;
  onConfirm: () => void;
  disabled?: boolean;
};

/** "I commit": tap when your name is typed, or hold for 1.5 s (pointer, Space or Enter). R6. */
export function HoldButton({ armed, onConfirm, disabled }: HoldButtonProps) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function start() {
    if (disabled || armed || timer.current) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setHolding(false);
      onConfirm();
    }, HOLD_MS);
  }

  function cancel() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => armed && onConfirm()}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onKeyDown={(e) => {
        if ((e.key === " " || e.key === "Enter") && !e.repeat && !armed) {
          e.preventDefault();
          start();
        }
      }}
      onKeyUp={(e) => (e.key === " " || e.key === "Enter") && cancel()}
      onContextMenu={(e) => e.preventDefault()}
      className="relative h-14 w-full overflow-hidden rounded-row bg-accent text-base font-bold text-on-accent select-none disabled:opacity-50"
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0 left-0 bg-accent-hover",
          holding ? "w-full transition-[width] ease-linear" : "w-0",
        )}
        style={{ transitionDuration: holding ? `${HOLD_MS}ms` : "0ms" }}
      />
      <span className="relative">
        {armed ? "I commit" : holding ? "Keep holding…" : "Hold to commit"}
      </span>
    </button>
  );
}
