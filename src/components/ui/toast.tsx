"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: "var(--card)",
          color: "var(--card-foreground)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        },
        classNames: {
          success: "!border-[var(--lavender)]",
          error: "!border-[var(--destructive)]",
          info: "!border-[var(--ring)]",
        },
      }}
      richColors
      closeButton
    />
  );
}

export { toast } from "sonner";
