import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getStandings } from "@/lib/standings";
import { ArrowRight, Target, Trophy, TrendingUp } from "lucide-react";

async function getDashboardData(userId: string) {
  const [standings, user, games, predictions] = await Promise.all([
    getStandings(),
    prisma.user.findUnique({
      where: { id: userId },
      select: { referral_points: true },
    }),
    prisma.game.findMany({
      select: { id: true, is_locked: true },
    }),
    prisma.prediction.findMany({
      where: { user_id: userId },
      select: { game_id: true, points_earned: true },
    }),
  ]);

  const me = standings.find((s) => s.id === userId);
  const predMap = new Map(predictions.map((p) => [p.game_id, p]));

  const unlockedGames = games.filter((g) => !g.is_locked);

  const predictedUnlocked = unlockedGames.filter((g) => predMap.has(g.id)).length;
  const totalUnlocked = unlockedGames.length;
  const unpredictedCount = totalUnlocked - predictedUnlocked;

  const predictionsOnFinished = predictions.filter(
    (p) => p.points_earned !== null
  );
  const correctCount = predictionsOnFinished.filter(
    (p) => (p.points_earned ?? 0) > 0
  ).length;
  const correctRatio =
    predictionsOnFinished.length > 0
      ? Math.round((correctCount / predictionsOnFinished.length) * 100)
      : null;

  return {
    rank: me?.rank ?? null,
    totalPlayers: standings.length,
    predictionPoints: me?.prediction_points ?? 0,
    referralPoints: user?.referral_points ?? 0,
    totalPoints: me?.total_points ?? 0,
    straightPicks: me?.straight_picks ?? 0,
    predictedUnlocked,
    totalUnlocked,
    unpredictedCount,
    correctCount,
    totalFinished: predictionsOnFinished.length,
    correctRatio,
  };
}

function StatCard({
  label,
  children,
  icon,
}: {
  label: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  if (session.role === "admin") {
    redirect("/admin");
  }

  const data = await getDashboardData(session.id);
  const progressPct =
    data.totalUnlocked > 0
      ? Math.round((data.predictedUnlocked / data.totalUnlocked) * 100)
      : 0;

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">
          Zdravo, {session.username} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          SP 2026 — Grupa fanova
        </p>
      </div>

      {/* Rank */}
      <StatCard label="Plasman" icon={<Trophy size={14} />}>
        {data.rank !== null ? (
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-primary">
              #{data.rank}
            </span>
            <span className="text-muted-foreground text-sm mb-1">
              od {data.totalPlayers} igrača
            </span>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Napravi prvi tip da se pojavljuješ na tabeli.
          </p>
        )}
      </StatCard>

      {/* Points breakdown */}
      <StatCard label="Poeni" icon={<TrendingUp size={14} />}>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {data.predictionPoints}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">tipovi</p>
          </div>
          <span className="text-muted-foreground text-lg font-light">+</span>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {data.referralPoints}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">referal</p>
          </div>
          <span className="text-muted-foreground text-lg font-light">=</span>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {data.totalPoints}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">ukupno</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-sm font-semibold text-foreground">
              {data.straightPicks}
            </p>
            <p className="text-xs text-muted-foreground">2-bod. tipovi</p>
          </div>
        </div>
      </StatCard>

      {/* Prediction progress */}
      <StatCard label="Napredak tipovanja" icon={<Target size={14} />}>
        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-foreground">
              {data.predictedUnlocked}
              <span className="text-base text-muted-foreground font-normal">
                /{data.totalUnlocked}
              </span>
            </span>
            {data.correctRatio !== null && (
              <span className="text-sm text-muted-foreground">
                {data.correctCount}/{data.totalFinished} tačno (
                <span className="text-foreground font-medium">
                  {data.correctRatio}%
                </span>
                )
              </span>
            )}
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {progressPct}% otvorenih utakmica tipovano
          </p>
        </div>
      </StatCard>

      {/* CTA if unpredicted games */}
      {data.unpredictedCount > 0 && (
        <Link
          href="/predictions"
          className="flex items-center justify-between w-full bg-primary/10 border border-primary/30 rounded-xl px-4 py-4 hover:bg-primary/15 hover:shadow-[0_0_16px_rgba(245,197,24,0.2)] transition-all duration-200 group"
        >
          <div>
            <p className="font-semibold text-primary text-sm">
              {data.unpredictedCount}{" "}
              {data.unpredictedCount === 1
                ? "utakmica čeka tvoj tip"
                : "utakmica čeka tvoje tipove"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Zatvori otvorene tipove pre kikoffa
            </p>
          </div>
          <ArrowRight
            size={18}
            className="text-primary group-hover:translate-x-1 transition-transform duration-200"
          />
        </Link>
      )}
    </div>
  );
}