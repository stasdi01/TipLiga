import { prisma } from "@/lib/prisma";

export type StandingRow = {
  id: string;
  username: string;
  prediction_points: number;
  straight_picks: number;
  referral_points: number;
  total_points: number;
  rank: number;
};

export async function getStandings(): Promise<StandingRow[]> {
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
    return {
      id: u.id,
      username: u.username,
      prediction_points,
      straight_picks,
      referral_points: u.referral_points,
      total_points: prediction_points + u.referral_points,
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