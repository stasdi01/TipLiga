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
    timeZone: "UTC",
  }).format(new Date(date));
}

function HistoryRow({ game, pred }: { game: Game; pred?: SavedPred }) {
  const hasPred = !!pred;
  const hasResult = !!game.result;
  const pts = pred?.points_earned ?? null;

  let statusIcon = <MinusCircle size={14} className="text-muted-foreground/50" />;
  let statusClass = "text-muted-foreground";

  if (hasPred && hasResult) {
    if (pts === 2) {
      statusIcon = <CheckCircle2 size={14} className="text-green-400" />;
      statusClass = "text-green-400";
    } else if (pts === 1) {
      statusIcon = <CheckCircle2 size={14} className="text-yellow-400" />;
      statusClass = "text-yellow-400";
    } else if (pts === 0) {
      statusIcon = <XCircle size={14} className="text-red-400" />;
      statusClass = "text-red-400";
    } else {
      statusIcon = <Clock size={14} className="text-muted-foreground" />;
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
  // Games confirmed this session — hidden from Tipuj immediately without waiting for server
  const [localConfirmed, setLocalConfirmed] = useState<Set<string>>(new Set());

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

  function handleConfirmed(confirmedIds: string[]) {
    setTicket(new Map());
    setLocalConfirmed((prev) => {
      const next = new Set(prev);
      confirmedIds.forEach((id) => next.add(id));
      return next;
    });
  }

  // Games confirmed = already in DB or confirmed locally this session
  function isPredicted(gameId: string) {
    return savedMap.has(gameId) || localConfirmed.has(gameId);
  }

  // Tipuj: open games with no confirmed prediction (ticket picks still visible here)
  const tipujGames = openGames.filter((g) => !isPredicted(g.id));

  // Istorija: open games already predicted + all locked games
  const confirmedOpenGames = openGames.filter((g) => isPredicted(g.id));
  const historijGames = [...confirmedOpenGames, ...lockedGames];

  const ticketPicks = Array.from(ticket.values());
  const unpredicted = tipujGames.filter((g) => !ticket.has(g.id)).length;

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Tipovi</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {tab === "tipuj"
            ? unpredicted > 0
              ? `${unpredicted} utakmica čeka tvoj tip`
              : "Sve otvorene utakmice su tipovane!"
            : `${historijGames.length} u istoriji`}
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
            {t === "tipuj"
              ? `Tipuj${tipujGames.length > 0 ? ` (${tipujGames.length})` : ""}`
              : `Istorija (${historijGames.length})`}
          </button>
        ))}
      </div>

      {/* Tipuj tab */}
      {tab === "tipuj" && (
        <>
          <Suspense>
            <GroupFilter groups={groups} />
          </Suspense>

          {tipujGames.length === 0 && (
            <div className="text-center py-10 space-y-1">
              <p className="text-foreground font-medium text-sm">Sve tipovano! 🎉</p>
              <p className="text-muted-foreground text-xs">
                Idi na Istoriju da pratiš rezultate.
              </p>
            </div>
          )}

          <div className="space-y-3">
            {tipujGames.map((game) => (
              <PredictionCard
                key={game.id}
                game={game}
                savedPrediction={null}
                pointsEarned={null}
                ticketPick={ticket.get(game.id)?.prediction ?? null}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </>
      )}

      {/* Istorija tab */}
      {tab === "istorija" && (
        <div className="rounded-xl border border-border overflow-hidden">
          {historijGames.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Još nisi potvrdio nijedan tip.
            </p>
          ) : (
            historijGames.map((game) => (
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
        onConfirmed={handleConfirmed}
      />
    </div>
  );
}