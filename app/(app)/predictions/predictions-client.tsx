"use client";

import { useState, Suspense } from "react";
import { PredictionType, GameOutcome } from "@/app/generated/prisma";
import PredictionCard from "./prediction-card";
import TicketPanel, { TicketPick } from "./ticket-panel";
import GroupFilter from "./group-filter";
import { CheckCircle2, XCircle, Clock, MinusCircle } from "lucide-react";

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
  openGames: Game[];
  lockedGames: Game[];
  savedPredictions: SavedPred[];
  groups: string[];
};

const PICK_LABEL: Record<PredictionType, (t1: string, t2: string) => string> = {
  TEAM1: (t1) => t1,
  DRAW: () => "Nerešeno",
  TEAM2: (_, t2) => t2,
  TEAM1_OR_DRAW: (t1) => `${t1} ili nerešeno`,
  TEAM2_OR_DRAW: (_, t2) => `${t2} ili nerešeno`,
};

const OUTCOME_LABEL: Record<GameOutcome, string> = {
  TEAM1_WIN: "Tim 1",
  DRAW: "Nerešeno",
  TEAM2_WIN: "Tim 2",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function HistoryRow({ game, pred }: { game: Game; pred?: SavedPred }) {
  const hasPred = !!pred;
  const hasResult = !!game.result;
  const pts = pred?.points_earned ?? null;

  let statusIcon = <MinusCircle size={14} className="text-muted-foreground/50" />;
  let statusClass = "text-muted-foreground";

  if (hasPred && hasResult && pts !== null) {
    if (pts === 2) {
      statusIcon = <CheckCircle2 size={14} className="text-green-400" />;
      statusClass = "text-green-400";
    } else if (pts === 1) {
      statusIcon = <CheckCircle2 size={14} className="text-primary" />;
      statusClass = "text-primary";
    } else {
      statusIcon = <XCircle size={14} className="text-destructive" />;
      statusClass = "text-destructive";
    }
  } else if (hasPred && !hasResult) {
    statusIcon = <Clock size={14} className="text-muted-foreground" />;
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {game.team1} <span className="text-muted-foreground font-normal">vs</span> {game.team2}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {game.group} · {formatDate(game.kickoff_time)}
        </p>
      </div>

      <div className="text-right shrink-0 space-y-0.5">
        {hasPred ? (
          <p className={`text-xs font-medium ${statusClass}`}>
            {PICK_LABEL[pred!.prediction](game.team1, game.team2)}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/50 italic">Nije tipovano</p>
        )}
        {hasResult && (
          <p className="text-xs text-muted-foreground">
            Rezultat: {OUTCOME_LABEL[game.result!.outcome]}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0 w-12 justify-end">
        {statusIcon}
        {hasPred && hasResult && pts !== null && (
          <span className={`text-xs font-bold ${statusClass}`}>{pts}pt</span>
        )}
      </div>
    </div>
  );
}

export default function PredictionsClient({
  openGames,
  lockedGames,
  savedPredictions,
  groups,
}: Props) {
  const [tab, setTab] = useState<"tipuj" | "istorija">("tipuj");
  const [ticket, setTicket] = useState<Map<string, TicketPick>>(new Map());

  const savedMap = new Map(savedPredictions.map((p) => [p.game_id, p]));

  function handleSelect(gameId: string, team1: string, team2: string, prediction: PredictionType) {
    setTicket((prev) => {
      const next = new Map(prev);
      if (next.get(gameId)?.prediction === prediction) {
        next.delete(gameId);
      } else {
        next.set(gameId, { gameId, team1, team2, prediction });
      }
      return next;
    });
  }

  const ticketPicks = Array.from(ticket.values());
  const unpredicted = openGames.filter(
    (g) => !savedMap.has(g.id) && !ticket.has(g.id)
  ).length;

  const tippedLocked = lockedGames.filter((g) => savedMap.has(g.id)).length;
  const missedLocked = lockedGames.filter((g) => !savedMap.has(g.id)).length;

  return (
    <div className="space-y-4 pb-36">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">Tipovi</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {tab === "tipuj"
            ? unpredicted > 0
              ? `${unpredicted} utakmica čeka tvoj tip`
              : "Sve otvorene utakmice su tipovane!"
            : `${tippedLocked} tipovano · ${missedLocked} propušteno`}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary p-1 rounded-xl">
        {(["tipuj", "istorija"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "tipuj" ? "Tipuj" : `Istorija (${lockedGames.length})`}
          </button>
        ))}
      </div>

      {/* Tipuj tab */}
      {tab === "tipuj" && (
        <>
          <Suspense>
            <GroupFilter groups={groups} />
          </Suspense>

          {openGames.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-8">
              Nema otvorenih utakmica u ovoj grupi.
            </p>
          )}

          <div className="space-y-3">
            {openGames.map((game) => {
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
        </>
      )}

      {/* Istorija tab */}
      {tab === "istorija" && (
        <div className="rounded-xl border border-border overflow-hidden">
          {lockedGames.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Nema zaključanih utakmica još uvek.
            </p>
          ) : (
            lockedGames.map((game) => (
              <HistoryRow
                key={game.id}
                game={game}
                pred={savedMap.get(game.id)}
              />
            ))
          )}
        </div>
      )}

      <TicketPanel
        picks={ticketPicks}
        onRemove={(id) =>
          setTicket((prev) => {
            const next = new Map(prev);
            next.delete(id);
            return next;
          })
        }
        onClear={() => setTicket(new Map())}
        onConfirmed={() => setTicket(new Map())}
      />
    </div>
  );
}