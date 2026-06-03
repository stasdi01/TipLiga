import { prisma } from "@/lib/prisma";
import ResultForm from "./result-form";
import { GameOutcome } from "@/app/generated/prisma";

const outcomeLabel: Record<GameOutcome, string> = {
  [GameOutcome.TEAM1_WIN]: "Tim 1 pobeduje",
  [GameOutcome.DRAW]: "Nerešeno",
  [GameOutcome.TEAM2_WIN]: "Tim 2 pobeduje",
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

export default async function AdminResultsPage() {
  const games = await prisma.game.findMany({
    where: { is_locked: true },
    include: {
      result: true,
      _count: { select: { predictions: true } },
    },
    orderBy: { kickoff_time: "asc" },
  });

  const pending = games.filter((g) => !g.result);
  const entered = games.filter((g) => g.result);

  if (games.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-foreground">Rezultati</h1>
        <p className="text-muted-foreground text-sm">
          Nema zaključanih utakmica. Zaključaj utakmice pre unosa rezultata.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-foreground">Rezultati</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {pending.length} čeka unos · {entered.length} uneseno
        </p>
      </div>

      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">
            Čeka unos rezultata
          </h2>
          <div className="rounded-xl border border-border overflow-hidden">
            {pending.map((game, i) => (
              <div
                key={game.id}
                className={`px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3 ${
                  i < pending.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">
                    {game.team1}{" "}
                    <span className="text-muted-foreground font-normal">vs</span>{" "}
                    {game.team2}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {game.group} · {formatDate(game.kickoff_time)} ·{" "}
                    {game._count.predictions} tipova
                  </p>
                </div>
                <ResultForm
                  gameId={game.id}
                  team1={game.team1}
                  team2={game.team2}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {entered.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">
            Uneseni rezultati
          </h2>
          <div className="rounded-xl border border-border overflow-hidden">
            {entered.map((game, i) => (
              <div
                key={game.id}
                className={`px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-3 ${
                  i < entered.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">
                    {game.team1}{" "}
                    <span className="text-muted-foreground font-normal">vs</span>{" "}
                    {game.team2}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {game.group} · {formatDate(game.kickoff_time)} ·{" "}
                    {game._count.predictions} tipova
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary font-medium">
                    {game.result ? outcomeLabel[game.result.outcome] : ""}
                  </span>
                  <ResultForm
                    gameId={game.id}
                    team1={game.team1}
                    team2={game.team2}
                    currentOutcome={game.result?.outcome}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}