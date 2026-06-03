"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createGame } from "./actions";

const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
const initialState = { error: undefined as string | undefined, success: undefined as boolean | undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:shadow-[0_0_16px_rgba(245,197,24,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
    >
      {pending ? "Dodavanje..." : "Dodaj utakmicu"}
    </button>
  );
}

export default function CreateGameForm() {
  const [state, formAction] = useFormState(createGame, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="font-semibold text-foreground mb-4">Dodaj utakmicu</h2>
      <form ref={formRef} action={formAction} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Tim 1 *
            </label>
            <input
              name="team1"
              type="text"
              required
              className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Brazil"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Tim 2 *
            </label>
            <input
              name="team2"
              type="text"
              required
              className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Argentina"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Grupa *
            </label>
            <select
              name="group"
              required
              defaultValue=""
              className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="" disabled>Izaberi grupu</option>
              {GROUPS.map((g) => (
                <option key={g} value={g}>
                  Grupa {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Datum *
            </label>
            <input
              name="kickoff_date"
              type="date"
              required
              className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Vreme (HH:MM) *
            </label>
            <input
              name="kickoff_time_of_day"
              type="time"
              required
              className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {state.error && (
          <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className="text-sm text-primary bg-primary/10 px-3 py-2 rounded-lg">
            Utakmica uspešno dodata!
          </p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}