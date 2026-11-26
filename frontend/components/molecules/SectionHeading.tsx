import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  action?: ReactNode;
};

export function SectionHeading({ eyebrow, title, action }: SectionHeadingProps) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="section-eyebrow">{eyebrow}</p>
        <h2 className="section-title">{title}</h2>
      </div>
      {action}
    </div>
  );
}
