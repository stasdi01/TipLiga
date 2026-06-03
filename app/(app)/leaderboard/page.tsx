import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Trophy } from "lucide-react";

async function getStandings() {
  const users = await prisma.user.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      username: true,
      referral_points: true,
      predictions: {
        select: { points_earned: true },
        where: { points_earned: { not: null } },
      },
    },
  });

  const rows = users.map((u) => {
    const prediction_points = u.predictions.reduce(
      (sum, p) => sum + (p.points_earned ?? 0),
      0
    );
    const straight_picks = u.predictions.filter(
      (p) => p.points_earned === 2
    ).length;
    const total_points = prediction_points + u.referral_points;
    return {
      id: u.id,
      username: u.username,
      prediction_points,
      straight_picks,
      referral_points: u.referral_points,
      total_points,
    };
  });

  rows.sort((a, b) => {
    if (b.total_points !== a.total_points) return b.total_points - a.total_points;
    return b.straight_picks - a.straight_picks;
  });

  let rank = 1;
  return rows.map((row, i) => {
    if (
      i > 0 &&
      (rows[i - 1].total_points !== row.total_points ||
        rows[i - 1].straight_picks !== row.straight_picks)
    ) {
      rank = i + 1;
    }
    return { ...row, rank };
  });
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default async function LeaderboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const standings = await getStandings();

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-2">
        <Trophy size={20} className="text-primary" />
        <div>
          <h1 className="text-xl font-bold text-foreground">Tabela</h1>
          <p className="text-sm text-muted-foreground">
            {standings.length} igrača · tiebreaker: broj tačnih 2-bodovnih tipova
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm min-w-[480px]">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium w-10">#</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Igrač</th>
              <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">Tip pts</th>
              <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">2-bod. tipovi</th>
              <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">Ref. pts</th>
              <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">Ukupno</th>
            </tr>
          </thead>
          <tbody>
            {standings.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  Nema igrača na tabeli još uvek.
                </td>
              </tr>
            )}
            {standings.map((row) => {
              const isMe = row.id === session.id;
              return (
                <tr
                  key={row.id}
                  className={`border-b border-border last:border-0 transition-colors ${
                    isMe
                      ? "bg-primary/8 border-primary/20"
                      : "hover:bg-card/50"
                  }`}
                >
                  <td className="px-4 py-3 text-center font-bold text-base">
                    {MEDAL[row.rank] ?? (
                      <span className="text-muted-foreground text-sm font-normal">
                        {row.rank}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${isMe ? "text-primary" : "text-foreground"}`}>
                      {row.username}
                    </span>
                    {isMe && (
                      <span className="ml-2 text-[10px] text-primary/70 font-medium">
                        ti
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {row.prediction_points}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {row.straight_picks}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {row.referral_points}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-bold text-base ${isMe ? "text-primary" : "text-foreground"}`}>
                      {row.total_points}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}