"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { PredictionType } from "@/app/generated/prisma";

export async function saveTicket(
  picks: { gameId: string; prediction: PredictionType }[]
): Promise<{ saved: number }> {
  const session = await getSession();
  if (!session || session.role !== "user") return { saved: 0 };
  if (picks.length === 0) return { saved: 0 };

  const gameIds = picks.map((p) => p.gameId);
  const games = await prisma.game.findMany({
    where: { id: { in: gameIds }, is_locked: false },
    select: { id: true },
  });
  const unlocked = new Set(games.map((g) => g.id));

  const valid = picks.filter((p) => unlocked.has(p.gameId));
  if (valid.length === 0) return { saved: 0 };

  await Promise.all(
    valid.map((p) =>
      prisma.prediction.upsert({
        where: { user_id_game_id: { user_id: session.id, game_id: p.gameId } },
        create: { user_id: session.id, game_id: p.gameId, prediction: p.prediction },
        update: { prediction: p.prediction },
      })
    )
  );

  revalidatePath("/predictions");
  revalidatePath("/dashboard");
  return { saved: valid.length };
}