"use client";

import { useState, useTransition } from "react";
import { toggleUserStatus } from "./actions";
import { UserStatus } from "@/app/generated/prisma";

export default function ToggleStatusButton({
  userId,
  status,
}: {
  userId: string;
  status: UserStatus;
}) {
  const [optimistic, setOptimistic] = useState(status);
  const [, startTransition] = useTransition();

  const isActive = optimistic === UserStatus.ACTIVE;

  function handleClick() {
    const next = isActive ? UserStatus.INACTIVE : UserStatus.ACTIVE;
    setOptimistic(next);
    startTransition(() => {
      void toggleUserStatus(userId, optimistic);
    });
  }

  return (
    <button
      onClick={handleClick}
      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-200 hover:scale-[1.05] active:scale-[0.97] ${
        isActive
          ? "bg-primary/15 text-primary hover:bg-destructive/15 hover:text-destructive hover:shadow-[0_0_10px_rgba(220,38,38,0.25)]"
          : "bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary hover:shadow-[0_0_10px_rgba(245,197,24,0.25)]"
      }`}
    >
      {isActive ? "Aktivan" : "Neaktivan"}
    </button>
  );
}