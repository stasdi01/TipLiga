"use client";

import { useState, useTransition } from "react";
import { X, CheckCircle } from "lucide-react";
import { saveTicket } from "./actions";
import { PredictionType } from "@/app/generated/prisma";

export type TicketPick = {
  gameId: string;
  team1: string;
  team2: string;
  prediction: PredictionType;
};

const PICK_LABEL: Record<PredictionType, (t1: string, t2: string) => string> = {
  TEAM1: (t1) => t1,
  DRAW: () => "Nerešeno",
  TEAM2: (_, t2) => t2,
  TEAM1_OR_DRAW: (t1) => `${t1} ili ner.`,
  TEAM2_OR_DRAW: (_, t2) => `${t2} ili ner.`,
};

const IS_HEDGED = new Set<PredictionType>([
  PredictionType.TEAM1_OR_DRAW,
  PredictionType.TEAM2_OR_DRAW,
]);

export default function TicketPanel({
  picks,
  onRemove,
  onClear,
  onConfirmed,
}: {
  picks: TicketPick[];
  onRemove: (gameId: string) => void;
  onClear: () => void;
  onConfirmed: (confirmedIds: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [savedCount, setSavedCount] = useState<number | null>(null);

  if (picks.length === 0) return null;

  function handleConfirm() {
    startTransition(async () => {
      const result = await saveTicket(
        picks.map((p) => ({ gameId: p.gameId, prediction: p.prediction }))
      );
      setSavedCount(result.saved);
      onConfirmed(picks.map((p) => p.gameId));
      setTimeout(() => {
        setSavedCount(null);
        setOpen(false);
      }, 2000);
    });
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Right-side drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-40 w-72 flex flex-col bg-background border-l-2 border-primary/70 shadow-[-12px_0_50px_rgba(0,0,0,0.95)] transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-14 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary text-base">Listić</span>
            <span className="bg-primary text-primary-foreground text-xs font-black px-2 py-0.5 rounded-full min-w-[22px] text-center">
              {picks.length}
            </span>
          </div>
          <button
            onClick={onClear}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            Obriši sve
          </button>
        </div>

        {/* Picks list */}
        <div className="flex-1 overflow-y-auto divide-y divide-border">
          {picks.map((pick) => (
            <div key={pick.gameId} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">
                  {pick.team1} vs {pick.team2}
                </p>
                <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  {PICK_LABEL[pick.prediction](pick.team1, pick.team2)}
                  {IS_HEDGED.has(pick.prediction) && (
                    <span className="text-[10px] text-muted-foreground font-normal">
                      1pt
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => onRemove(pick.gameId)}
                className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-4 pb-20 border-t border-border space-y-3">
          {savedCount !== null && (
            <div className="flex items-center justify-center gap-1.5 text-sm text-green-400">
              <CheckCircle size={14} />
              {savedCount} sačuvano
            </div>
          )}
          <button
            onClick={handleConfirm}
            disabled={pending}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50 hover:shadow-[0_0_20px_rgba(245,197,24,0.45)] active:scale-[0.98] transition-all duration-200"
          >
            {pending
              ? "Čuvanje..."
              : `Potvrdi ${picks.length} ${
                  picks.length === 1
                    ? "tip"
                    : picks.length < 5
                    ? "tipa"
                    : "tipova"
                }`}
          </button>
        </div>
      </div>

      {/* Tab trigger — sticks to right edge, vertically centered */}
      <button
        onClick={() => setOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-20 bg-primary text-primary-foreground rounded-l-xl shadow-[-4px_0_24px_rgba(0,0,0,0.8)] flex flex-col items-center gap-1.5 px-2.5 py-4 hover:px-3 active:scale-95 transition-all duration-200"
        aria-label="Otvori listić"
      >
        <span className="font-black text-lg leading-none">{picks.length}</span>
        <span
          className="text-[9px] font-bold tracking-widest"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          LISTIĆ
        </span>
      </button>
    </>
  );
}
