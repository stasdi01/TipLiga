import { PredictionType, GameOutcome } from "@/app/generated/prisma";

export function calculatePoints(
  prediction: PredictionType,
  outcome: GameOutcome
): number {
  if (prediction === PredictionType.TEAM1 && outcome === GameOutcome.TEAM1_WIN) return 2;
  if (prediction === PredictionType.DRAW && outcome === GameOutcome.DRAW) return 2;
  if (prediction === PredictionType.TEAM2 && outcome === GameOutcome.TEAM2_WIN) return 2;
  if (
    prediction === PredictionType.TEAM1_OR_DRAW &&
    (outcome === GameOutcome.TEAM1_WIN || outcome === GameOutcome.DRAW)
  ) return 1;
  if (
    prediction === PredictionType.TEAM2_OR_DRAW &&
    (outcome === GameOutcome.TEAM2_WIN || outcome === GameOutcome.DRAW)
  ) return 1;
  return 0;
}