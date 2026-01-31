"use client";

import * as React from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
        onClick={() => onOpenChange(false)}
      />
      {/* Content Container (Center) */}
      <div className="fixed z-50 grid w-full max-w-lg scale-100 gap-4 p-4 opacity-100 animate-in zoom-in-95 slide-in-from-bottom-5">
         {children}
      </div>
    </div>
  );
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export function DialogContent({ children, className }: DialogContentProps) {
    // Note: Close button logic could be added here if needed context, but backdrop click works for now
    return (
        <div className={`relative w-full rounded-xl border bg-card p-6 shadow-lg ${className}`}>
            {children}
        </div>
    )
}

export function DialogTrigger({ children, onClick }: any) {
    return <div onClick={onClick}>{children}</div>
}
