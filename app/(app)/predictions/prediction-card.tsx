"use client";

import { Lock } from "lucide-react";
import { PredictionType, GameOutcome } from "@/app/generated/prisma";

type Props = {
  game: {
    id: string;
    team1: string;
    team2: string;
    group: string;
    kickoff_time: Date;
    is_locked: boolean;
    result: { outcome: GameOutcome } | null;
  };
  savedPrediction: PredictionType | null;
  pointsEarned: number | null;
  ticketPick: PredictionType | null;
  onSelect: (gameId: string, team1: string, team2: string, prediction: PredictionType) => void;
};

const OUTCOME_LABEL: Record<GameOutcome, string> = {
  TEAM1_WIN: "Tim 1 pobedio",
  DRAW: "Nerešeno",
  TEAM2_WIN: "Tim 2 pobedio",
};

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function PredictionCard({
  game,
  savedPrediction,
  pointsEarned,
  ticketPick,
  onSelect,
}: Props) {
  const straight: { type: PredictionType; label: string }[] = [
    { type: PredictionType.TEAM1, label: game.team1 },
    { type: PredictionType.DRAW, label: "Nerešeno" },
    { type: PredictionType.TEAM2, label: game.team2 },
  ];

  const hedged: { type: PredictionType; label: string }[] = [
    { type: PredictionType.TEAM1_OR_DRAW, label: `${game.team1} ili ner.` },
    { type: PredictionType.TEAM2_OR_DRAW, label: `${game.team2} ili ner.` },
  ];

  function btnClass(type: PredictionType) {
    const inTicket = ticketPick === type;
    const isSaved = savedPrediction === type && ticketPick === null;
    const hasResult = game.result !== null;

    if (game.is_locked) {
      if (isSaved || (savedPrediction === type)) {
        const correct = hasResult && (pointsEarned ?? 0) > 0;
        const wrong = hasResult && pointsEarned === 0;
        if (correct) return "bg-green-500/20 text-green-400 border-green-500/40";
        if (wrong) return "bg-destructive/15 text-destructive border-destructive/30";
        return "bg-primary/20 text-primary border-primary/50";
      }
      return "bg-secondary/40 text-muted-foreground/40 border-border/40 cursor-not-allowed opacity-50";
    }

    if (inTicket) return "bg-primary text-primary-foreground border-primary shadow-[0_0_12px_rgba(245,197,24,0.4)]";
    if (isSaved) return "bg-primary/20 text-primary border-primary/50";
    return "bg-secondary border-border text-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all duration-150 hover:scale-[1.02] active:scale-[0.97]";
  }

  return (
    <div className={`bg-card border rounded-xl p-4 space-y-3 transition-all duration-200 ${
      ticketPick ? "border-primary/30 shadow-[0_0_12px_rgba(245,197,24,0.08)]" : "border-border"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground text-sm leading-tight">
            {game.team1} <span className="text-muted-foreground font-normal">vs</span> {game.team2}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {game.group} · {formatTime(game.kickoff_time)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {game.result && (
            <span className="text-xs text-muted-foreground">
              {OUTCOME_LABEL[game.result.outcome]}
            </span>
          )}
          {game.is_locked && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground/60">
              <Lock size={11} />
              {savedPrediction && pointsEarned !== null && (
                <span className={pointsEarned > 0 ? "text-primary font-semibold" : "text-destructive"}>
                  {pointsEarned}pt
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {straight.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => !game.is_locked && onSelect(game.id, game.team1, game.team2, type)}
            disabled={game.is_locked}
            className={`text-xs py-2 px-1 rounded-lg border font-medium text-center truncate ${btnClass(type)}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        {hedged.map(({ type, label }) => (
          <button
            key={type}
            onClick={() => !game.is_locked && onSelect(game.id, game.team1, game.team2, type)}
            disabled={game.is_locked}
            className={`text-xs py-1.5 px-1 rounded-lg border font-medium text-center truncate ${btnClass(type)}`}
          >
            <span className="text-[10px] mr-1 opacity-60">1pt</span>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}