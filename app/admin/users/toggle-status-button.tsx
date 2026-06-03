"use client";

import { useTransition } from "react";
import { toggleUserStatus } from "./actions";
import { UserStatus } from "@/app/generated/prisma";

export default function ToggleStatusButton({
  userId,
  status,
}: {
  userId: string;
  status: UserStatus;
}) {
  const [pending, startTransition] = useTransition();
  const isActive = status === UserStatus.ACTIVE;

  function handleClick() {
    startTransition(() => {
      void toggleUserStatus(userId, status);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-200 disabled:opacity-50 hover:scale-[1.05] active:scale-[0.97] ${
        isActive
          ? "bg-primary/15 text-primary hover:bg-destructive/15 hover:text-destructive hover:shadow-[0_0_10px_rgba(220,38,38,0.25)]"
          : "bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary hover:shadow-[0_0_10px_rgba(245,197,24,0.25)]"
      }`}
    >
      {pending ? "..." : isActive ? "Aktivan" : "Neaktivan"}
    </button>
  );
}