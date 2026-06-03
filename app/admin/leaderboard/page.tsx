import { prisma } from "@/lib/prisma";
import { getStandings } from "@/lib/standings";

async function getAdminStandings() {
  const [standings, users] = await Promise.all([
    getStandings(),
    prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        referral_code: true,
        referred_by: { select: { username: true } },
        _count: { select: { predictions: true } },
      },
    }),
  ]);

  const userMap = new Map(users.map((u) => [u.id, u]));

  return standings.map((row) => ({
    ...row,
    referral_code: userMap.get(row.id)?.referral_code ?? "",
    referred_by: userMap.get(row.id)?.referred_by?.username ?? "",
    games_predicted: userMap.get(row.id)?._count.predictions ?? 0,
  }));
}

const MEDAL: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default async function AdminLeaderboardPage() {
  const rows = await getAdminStandings();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Tabela — Admin prikaz</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {rows.length} aktivnih igrača
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium w-10">#</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Igrač</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">Ref. kod</th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">Pozvao/la</th>
              <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">Tipovano</th>
              <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">Tip pts</th>
              <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">2-bod.</th>
              <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">Ref. pts</th>
              <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">Ukupno</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground text-sm">
                  Nema aktivnih igrača.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border last:border-0 hover:bg-card/50 transition-colors"
              >
                <td className="px-4 py-3 text-center font-bold text-base">
                  {MEDAL[row.rank] ?? (
                    <span className="text-muted-foreground text-sm font-normal">{row.rank}</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                  {row.username}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {row.referral_code}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                  {row.referred_by}
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">
                  {row.games_predicted}
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
                  <span className="font-bold text-base text-primary">
                    {row.total_points}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}