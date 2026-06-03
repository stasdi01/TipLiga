import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import PredictionCard from "./prediction-card";
import GroupFilter from "./group-filter";

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: { group?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const games = await prisma.game.findMany({
    orderBy: [{ kickoff_time: "asc" }],
    include: { result: { select: { outcome: true } } },
  });

  const predictions = session.role !== "admin"
    ? await prisma.prediction.findMany({
        where: { user_id: session.id },
        select: { game_id: true, prediction: true, points_earned: true },
      })
    : [];

  const predMap = new Map(predictions.map((p) => [p.game_id, p]));

  const groups = Array.from(new Set(games.map((g) => g.group))).sort();
  const filtered = searchParams.group
    ? games.filter((g) => g.group === searchParams.group)
    : games;

  const unpredicted = filtered.filter(
    (g) => !g.is_locked && !predMap.has(g.id)
  ).length;

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tipovi</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {unpredicted > 0
              ? `${unpredicted} utakmica čeka tvoj tip`
              : "Sve utakmice su tipovane!"}
          </p>
        </div>
      </div>

      <Suspense>
        <GroupFilter groups={groups} />
      </Suspense>

      {filtered.length === 0 && (
        <p className="text-muted-foreground text-sm text-center py-8">
          Nema utakmica u ovoj grupi.
        </p>
      )}

      <div className="space-y-3">
        {filtered.map((game) => {
          const pred = predMap.get(game.id);
          return (
            <PredictionCard
              key={game.id}
              game={game}
              currentPrediction={pred?.prediction ?? null}
              pointsEarned={pred?.points_earned ?? null}
            />
          );
        })}
      </div>
    </div>
  );
}