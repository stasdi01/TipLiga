"use client";

import { useState, useTransition } from "react";
import { Lock, LockOpen } from "lucide-react";
import { toggleGameLock } from "./actions";

export default function LockButton({
  gameId,
  isLocked,
}: {
  gameId: string;
  isLocked: boolean;
}) {
  const [optimistic, setOptimistic] = useState(isLocked);
  const [, startTransition] = useTransition();

  function handleClick() {
    setOptimistic(!optimistic);
    startTransition(() => {
      void toggleGameLock(gameId, optimistic);
    });
  }

  return (
    <button
      onClick={handleClick}
      title={optimistic ? "Otključaj utakmicu" : "Zaključaj utakmicu"}
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-200 hover:scale-[1.05] active:scale-[0.97] ${
        optimistic
          ? "bg-destructive/15 text-destructive hover:bg-destructive/25 hover:shadow-[0_0_10px_rgba(220,38,38,0.25)]"
          : "bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary hover:shadow-[0_0_10px_rgba(245,197,24,0.25)]"
      }`}
    >
      {optimistic ? (
        <>
          <Lock size={11} />
          Zaključana
        </>
      ) : (
        <>
          <LockOpen size={11} />
          Otvorena
        </>
      )}
    </button>
  );
}