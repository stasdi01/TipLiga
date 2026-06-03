"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

const WC_GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export async function createGame(
  _prev: { error?: string; success?: boolean },
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const session = await getSession();
  if (!session || session.role !== "admin") return { error: "Nedozvoljen pristup" };

  const team1 = (formData.get("team1") as string)?.trim();
  const team2 = (formData.get("team2") as string)?.trim();
  const group = (formData.get("group") as string)?.trim();
  const kickoff_date = formData.get("kickoff_date") as string;
  const kickoff_time_of_day = formData.get("kickoff_time_of_day") as string;

  if (!team1 || !team2 || !group || !kickoff_date || !kickoff_time_of_day)
    return { error: "Sva polja su obavezna" };
  if (team1.toLowerCase() === team2.toLowerCase())
    return { error: "Tim 1 i Tim 2 ne mogu biti isti" };
  if (!WC_GROUPS.includes(group))
    return { error: "Nevažeća grupa" };

  const kickoff_time = new Date(`${kickoff_date}T${kickoff_time_of_day}:00`);
  if (isNaN(kickoff_time.getTime()))
    return { error: "Nevažeći datum i vreme" };

  await prisma.game.create({
    data: {
      team1,
      team2,
      group: `Grupa ${group}`,
      kickoff_time,
    },
  });

  revalidatePath("/admin/games");
  return { success: true };
}

export async function toggleGameLock(
  gameId: string,
  isLocked: boolean
): Promise<void> {
  const session = await getSession();
  if (!session || session.role !== "admin") return;

  await prisma.game.update({
    where: { id: gameId },
    data: { is_locked: !isLocked },
  });

  revalidatePath("/admin/games");
  revalidatePath("/predictions");
}