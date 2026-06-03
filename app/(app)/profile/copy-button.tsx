"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${
        copied
          ? "bg-primary/20 text-primary"
          : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
      }`}
    >
      {copied ? (
        <>
          <Check size={13} />
          Kopirano!
        </>
      ) : (
        <>
          <Copy size={13} />
          Kopiraj
        </>
      )}
    </button>
  );
}