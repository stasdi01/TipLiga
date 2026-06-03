import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import PredictionsClient from "./predictions-client";

export default async function PredictionsPage({
  searchParams,
}: {
  searchParams: { group?: string };
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const allGames = await prisma.game.findMany({
    orderBy: [{ kickoff_time: "asc" }],
    include: { result: { select: { outcome: true } } },
  });

  const savedPredictions =
    session.role !== "admin"
      ? await prisma.prediction.findMany({
          where: { user_id: session.id },
          select: { game_id: true, prediction: true, points_earned: true },
        })
      : [];

  const openGames = allGames.filter((g) => !g.is_locked);
  const lockedGames = allGames.filter((g) => g.is_locked);
  const groups = Array.from(new Set(openGames.map((g) => g.group))).sort();

  const filteredOpen = searchParams.group
    ? openGames.filter((g) => g.group === searchParams.group)
    : openGames;

  return (
    <PredictionsClient
      openGames={filteredOpen}
      lockedGames={lockedGames}
      savedPredictions={savedPredictions}
      groups={groups}
    />
  );
}