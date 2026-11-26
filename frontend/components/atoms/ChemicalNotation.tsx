import { Fragment, type ReactNode } from "react";

type ChemicalNotationProps = {
  value: string;
  label?: string;
  className?: string;
};

const TOKEN_PATTERN = /(_(?:\d+|\{[^}]+\})|\^(?:[+-]|\d+[+-]?|\{[^}]+\}))/g;

function cleanToken(token: string) {
  return token.slice(1).replace(/^\{|\}$/g, "");
}

/**
 * Renders chemical notation using semantic sub/sup elements.
 * Mini syntax: H_2O, SO_4^2-, Na^+, e^-.
 */
export function ChemicalNotation({ value, label, className }: ChemicalNotationProps) {
  const parts = value.split(TOKEN_PATTERN);
  const nodes: ReactNode[] = parts.map((part, index) => {
    if (part.startsWith("_")) return <sub key={index}>{cleanToken(part)}</sub>;
    if (part.startsWith("^")) return <sup key={index}>{cleanToken(part)}</sup>;
    return <Fragment key={index}>{part}</Fragment>;
  });

  return <span aria-label={label ?? value.replaceAll("_", "")} className={`chemical-notation ${className ?? ""}`}>{nodes}</span>;
}
