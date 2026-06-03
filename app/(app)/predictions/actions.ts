"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PredictionType } from "@/app/generated/prisma";

export async function savePrediction(
  gameId: string,
  prediction: PredictionType
): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "user") return;

  const game = await prisma.game.findUnique({
    where: { id: gameId },
    select: { is_locked: true },
  });
  if (!game || game.is_locked) return;

  await prisma.prediction.upsert({
    where: { user_id_game_id: { user_id: session.id, game_id: gameId } },
    create: { user_id: session.id, game_id: gameId, prediction },
    update: { prediction },
  });

  revalidatePath("/predictions");
  revalidatePath("/dashboard");
}