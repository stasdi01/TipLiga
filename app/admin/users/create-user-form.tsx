"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createUser } from "./actions";

const initialState = { error: undefined as string | undefined, success: undefined as boolean | undefined };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 hover:shadow-[0_0_16px_rgba(245,197,24,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
    >
      {pending ? "Dodavanje..." : "Dodaj igrača"}
    </button>
  );
}

export default function CreateUserForm() {
  const [state, formAction] = useFormState(createUser, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="font-semibold text-foreground mb-4">Dodaj igrača</h2>
      <form ref={formRef} action={formAction} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Korisničko ime *
            </label>
            <input
              name="username"
              type="text"
              autoCapitalize="none"
              required
              className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="marko123"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Lozinka *
            </label>
            <input
              name="password"
              type="password"
              required
              className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="min. 6 karaktera"
            />
          </div>
          <div>
            <label className="block text-xs text-muted-foreground mb-1">
              Referal kod (opciono)
            </label>
            <input
              name="referral_code"
              type="text"
              maxLength={6}
              autoCapitalize="characters"
              className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-foreground text-sm uppercase focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="MARKO7"
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
            Igrač uspešno dodat!
          </p>
        )}

        <SubmitButton />
      </form>
    </div>
  );
}