"use client";

import { Input } from "@b-core/ui/components/input";
import { useState, type ComponentProps } from "react";
import { parseNumber } from "./parse-number";

type NumberInputProps = Omit<ComponentProps<"input">, "value" | "onChange" | "type"> & {
  value: number | null;
  onValueChange: (value: number | null) => void;
  decimals?: boolean;
};

/**
 * Numeric text field that keeps what the user typed ("78." stays "78.") and reports the
 * parsed number. A controlled numeric value alone would swallow the decimal point.
 */
export function NumberInput({
  value,
  onValueChange,
  decimals = false,
  ...props
}: NumberInputProps) {
  const [text, setText] = useState(value === null ? "" : String(value));
  return (
    <Input
      {...props}
      inputMode={decimals ? "decimal" : "numeric"}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onValueChange(parseNumber(e.target.value, decimals));
      }}
    />
  );
}
