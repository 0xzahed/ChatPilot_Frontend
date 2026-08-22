"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

function Dropdown({ trigger, items, align = "left", className }: DropdownProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block">
      <div onClick={() => setOpen((prev) => !prev)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[10rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md animate-fade-in",
            align === "right" ? "right-0" : "left-0",
            className
          )}
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                disabled={item.disabled}
                onClick={() => {
                  if (item.disabled) return;
                  item.onClick();
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
                  className
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export { Dropdown };
