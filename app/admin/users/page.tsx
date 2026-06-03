import { prisma } from "@/lib/prisma";
import CreateUserForm from "./create-user-form";
import ToggleStatusButton from "./toggle-status-button";

async function getUsers() {
  const users = await prisma.user.findMany({
    include: {
      referred_by: { select: { username: true } },
      referrals: { select: { id: true } },
      predictions: { select: { points_earned: true } },
    },
    orderBy: { created_at: "asc" },
  });

  return users.map((u) => ({
    ...u,
    prediction_points: u.predictions.reduce(
      (sum, p) => sum + (p.points_earned ?? 0),
      0
    ),
    total_points:
      u.predictions.reduce((sum, p) => sum + (p.points_earned ?? 0), 0) +
      u.referral_points,
    referral_count: u.referrals.length,
  }));
}

export default async function AdminUsersPage() {
  const users = await getUsers();
  const activeCount = users.filter((u) => u.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Igrači</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {activeCount} aktivnih · {users.length} ukupno
          </p>
        </div>
      </div>

      <CreateUserForm />

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">
                Korisnik
              </th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">
                Ref. kod
              </th>
              <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">
                Pozvao
              </th>
              <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">
                Pozivi
              </th>
              <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">
                Ref. pts
              </th>
              <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">
                Tip pts
              </th>
              <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">
                Ukupno
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-muted-foreground text-sm"
                >
                  Nema igrača. Dodaj prvog igrača gore.
                </td>
              </tr>
            )}
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-b border-border last:border-0 hover:bg-card/50 transition-colors"
              >
                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                  {user.username}
                </td>
                <td className="px-4 py-3">
                  <ToggleStatusButton
                    userId={user.id}
                    status={user.status}
                  />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {user.referral_code}
                </td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                  {user.referred_by?.username ?? "—"}
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">
                  {user.referral_count}
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">
                  {user.referral_points}
                </td>
                <td className="px-4 py-3 text-center text-muted-foreground">
                  {user.prediction_points}
                </td>
                <td className="px-4 py-3 text-center font-semibold text-primary">
                  {user.total_points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}