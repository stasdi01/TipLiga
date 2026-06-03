"use client";

import { useState, Suspense } from "react";
import { PredictionType, GameOutcome } from "@/app/generated/prisma";
import PredictionCard from "./prediction-card";
import TicketPanel, { TicketPick } from "./ticket-panel";
import GroupFilter from "./group-filter";

type Game = {
  id: string;
  team1: string;
  team2: string;
  group: string;
  kickoff_time: Date;
  is_locked: boolean;
  result: { outcome: GameOutcome } | null;
};

type SavedPred = {
  game_id: string;
  prediction: PredictionType;
  points_earned: number | null;
};

type Props = {
  games: Game[];
  savedPredictions: SavedPred[];
  groups: string[];
};

export default function PredictionsClient({ games, savedPredictions, groups }: Props) {
  const [ticket, setTicket] = useState<Map<string, TicketPick>>(new Map());

  const savedMap = new Map(savedPredictions.map((p) => [p.game_id, p]));

  function handleSelect(gameId: string, team1: string, team2: string, prediction: PredictionType) {
    setTicket((prev) => {
      const next = new Map(prev);
      const existing = next.get(gameId);
      if (existing?.prediction === prediction) {
        next.delete(gameId);
      } else {
        next.set(gameId, { gameId, team1, team2, prediction });
      }
      return next;
    });
  }

  function handleRemove(gameId: string) {
    setTicket((prev) => {
      const next = new Map(prev);
      next.delete(gameId);
      return next;
    });
  }

  function handleClear() {
    setTicket(new Map());
  }

  function handleConfirmed() {
    setTicket(new Map());
  }

  const ticketPicks = Array.from(ticket.values());
  const unpredicted = games.filter(
    (g) => !g.is_locked && !savedMap.has(g.id) && !ticket.has(g.id)
  ).length;

  return (
    <div className="space-y-4 pb-36">
      <div>
        <h1 className="text-xl font-bold text-foreground">Tipovi</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {unpredicted > 0
            ? `${unpredicted} utakmica čeka tvoj tip`
            : "Sve otvorene utakmice su tipovane!"}
        </p>
      </div>

      <Suspense>
        <GroupFilter groups={groups} />
      </Suspense>

      <div className="space-y-3">
        {games.map((game) => {
          const saved = savedMap.get(game.id);
          return (
            <PredictionCard
              key={game.id}
              game={game}
              savedPrediction={saved?.prediction ?? null}
              pointsEarned={saved?.points_earned ?? null}
              ticketPick={ticket.get(game.id)?.prediction ?? null}
              onSelect={handleSelect}
            />
          );
        })}
      </div>

      <TicketPanel
        picks={ticketPicks}
        onRemove={handleRemove}
        onClear={handleClear}
        onConfirmed={handleConfirmed}
      />
    </div>
  );
}