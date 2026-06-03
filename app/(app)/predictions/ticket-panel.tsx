"use client";

import { useState, useTransition } from "react";
import { X, ChevronUp, ChevronDown, CheckCircle } from "lucide-react";
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

const IS_HEDGED = new Set<PredictionType>([PredictionType.TEAM1_OR_DRAW, PredictionType.TEAM2_OR_DRAW]);

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
  const [open, setOpen] = useState(true);
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
      setTimeout(() => setSavedCount(null), 3000);
    });
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-20 flex justify-center px-3 pointer-events-none">
      <div className="w-full max-w-2xl pointer-events-auto">
        <div className="bg-card border border-primary/40 rounded-2xl shadow-[0_0_30px_rgba(245,197,24,0.15)] overflow-hidden">

          {/* Header */}
          <button
            onClick={() => setOpen(!open)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-primary">Listić</span>
              <span className="bg-primary text-primary-foreground text-xs font-black px-2 py-0.5 rounded-full min-w-[22px] text-center">
                {picks.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {savedCount !== null && (
                <span className="flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle size={13} />
                  {savedCount} sačuvano
                </span>
              )}
              {open ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronUp size={16} className="text-muted-foreground" />}
            </div>
          </button>

          {/* Picks list */}
          {open && (
            <>
              <div className="max-h-52 overflow-y-auto divide-y divide-border">
                {picks.map((pick) => (
                  <div key={pick.gameId} className="flex items-center gap-3 px-4 py-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        {pick.team1} vs {pick.team2}
                      </p>
                      <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        {PICK_LABEL[pick.prediction](pick.team1, pick.team2)}
                        {IS_HEDGED.has(pick.prediction) && (
                          <span className="text-[10px] text-muted-foreground font-normal">1pt</span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemove(pick.gameId)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-border flex items-center gap-2">
                <button
                  onClick={onClear}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                >
                  Obriši sve
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={pending}
                  className="ml-auto h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50 hover:shadow-[0_0_20px_rgba(245,197,24,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  {pending ? "Čuvanje..." : `Potvrdi ${picks.length} ${picks.length === 1 ? "tip" : picks.length < 5 ? "tipa" : "tipova"}`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}