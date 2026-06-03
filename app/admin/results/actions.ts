"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { GameOutcome } from "@/app/generated/prisma";
import { calculatePoints } from "@/lib/scoring";

export async function saveResult(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession();
  if (!session || session.role !== "admin") return { error: "Nedozvoljen pristup" };

  const gameId = formData.get("game_id") as string;
  const outcomeRaw = formData.get("outcome") as string;

  if (!gameId || !outcomeRaw) return { error: "Nedostaju podaci" };
  if (!Object.values(GameOutcome).includes(outcomeRaw as GameOutcome))
    return { error: "Nevažeći rezultat" };

  const outcome = outcomeRaw as GameOutcome;

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    include: { predictions: true },
  });

  if (!game) return { error: "Utakmica nije pronađena" };
  if (!game.is_locked) return { error: "Utakmica mora biti zaključana pre unosa rezultata" };

  await prisma.$transaction(async (tx) => {
    await tx.result.upsert({
      where: { game_id: gameId },
      create: { game_id: gameId, outcome },
      update: { outcome },
    });

    for (const prediction of game.predictions) {
      const points = calculatePoints(prediction.prediction, outcome);
      await tx.prediction.update({
        where: { id: prediction.id },
        data: { points_earned: points },
      });
    }
  });

  revalidatePath("/admin/results");
  revalidatePath("/leaderboard");
  revalidatePath("/dashboard");
  return { success: true };
}