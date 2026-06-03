"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveResult } from "./actions";
import { GameOutcome } from "@/app/generated/prisma";

const initialState = { error: undefined as string | undefined, success: undefined as boolean | undefined };


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold disabled:opacity-50 hover:shadow-[0_0_14px_rgba(245,197,24,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 whitespace-nowrap"
    >
      {pending ? "Čuvanje..." : "Sačuvaj"}
    </button>
  );
}

export default function ResultForm({
  gameId,
  team1,
  team2,
  currentOutcome,
}: {
  gameId: string;
  team1: string;
  team2: string;
  currentOutcome?: GameOutcome;
}) {
  const [state, formAction] = useFormState(saveResult, initialState);

  const options = [
    { value: GameOutcome.TEAM1_WIN, label: `${team1} pobeduje` },
    { value: GameOutcome.DRAW, label: "Nerešeno" },
    { value: GameOutcome.TEAM2_WIN, label: `${team2} pobeduje` },
  ];

  return (
    <form action={formAction} className="flex items-center gap-2 flex-wrap">
      <input type="hidden" name="game_id" value={gameId} />
      <select
        name="outcome"
        defaultValue={currentOutcome ?? ""}
        className="h-9 px-2 rounded-lg bg-secondary border border-border text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="" disabled>Izaberi rezultat</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <SubmitButton />
      {state.error && (
        <span className="text-xs text-destructive">{state.error}</span>
      )}
      {state.success && (
        <span className="text-xs text-primary">✓ Sačuvano</span>
      )}
    </form>
  );
}