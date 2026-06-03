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
      className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors disabled:opacity-50 ${
        isActive
          ? "bg-primary/15 text-primary hover:bg-destructive/15 hover:text-destructive"
          : "bg-muted text-muted-foreground hover:bg-primary/15 hover:text-primary"
      }`}
    >
      {pending ? "..." : isActive ? "Aktivan" : "Neaktivan"}
    </button>
  );
}