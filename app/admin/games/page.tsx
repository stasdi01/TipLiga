import { prisma } from "@/lib/prisma";
import CreateGameForm from "./create-game-form";
import LockButton from "./lock-button";

function formatKickoff(date: Date) {
  return new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export default async function AdminGamesPage() {
  const games = await prisma.game.findMany({
    orderBy: [{ kickoff_time: "asc" }],
  });

  const lockedCount = games.filter((g) => g.is_locked).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Utakmice</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {games.length} ukupno · {lockedCount} zaključanih
        </p>
      </div>

      <CreateGameForm />

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">
                #
              </th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">
                Utakmica
              </th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">
                Grupa
              </th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">
                Datum i vreme
              </th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {games.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground text-sm"
                >
                  Nema utakmica. Dodaj prvu utakmicu gore.
                </td>
              </tr>
            )}
            {games.map((game, i) => (
              <tr
                key={game.id}
                className="border-b border-border last:border-0 hover:bg-card/50 transition-colors"
              >
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {i + 1}
                </td>
                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                  {game.team1}{" "}
                  <span className="text-muted-foreground font-normal">vs</span>{" "}
                  {game.team2}
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {game.group}
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap font-mono text-xs">
                  {formatKickoff(game.kickoff_time)}
                </td>
                <td className="px-4 py-3">
                  <LockButton
                    gameId={game.id}
                    isLocked={game.is_locked}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}