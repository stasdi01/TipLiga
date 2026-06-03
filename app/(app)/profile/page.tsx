import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Users, Gift } from "lucide-react";
import CopyButton from "./copy-button";

const MAX_REFERRAL_POINTS = 5;

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "admin") redirect("/admin");

  const [user, predictions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.id },
      select: {
        username: true,
        referral_code: true,
        referral_points: true,
        referred_by: { select: { username: true } },
        referrals: { select: { username: true } },
        created_at: true,
      },
    }),
    prisma.prediction.findMany({
      where: { user_id: session.id },
      select: { points_earned: true },
      orderBy: { created_at: "desc" },
    }),
  ]);

  if (!user) redirect("/login");

  const predictionPoints = predictions.reduce(
    (sum, p) => sum + (p.points_earned ?? 0),
    0
  );
  const totalPoints = predictionPoints + user.referral_points;
  const remaining = Math.max(0, MAX_REFERRAL_POINTS - user.referral_points);

  const memberSince = new Intl.DateTimeFormat("sr-RS", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(user.created_at));

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">{user.username}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Član od {memberSince}
          {user.referred_by && (
            <> · pozvao/la te <span className="text-foreground">{user.referred_by.username}</span></>
          )}
        </p>
      </div>

      {/* Referral code */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Gift size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Tvoj referal kod
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-4xl font-black text-primary tracking-widest">
            {user.referral_code}
          </span>
          <CopyButton text={user.referral_code} />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Podeli ovaj kod sa prijateljem. Kad admin unese tvoj kod pri kreiranju
          novog naloga, i ti i novi igrač dobijate po +1 referal poen.
        </p>
      </div>

      {/* Referral progress */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Users size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            Referal poeni
          </span>
        </div>

        {/* Progress bar */}
        <div className="flex items-end gap-3 mb-3">
          <span className="text-3xl font-black text-foreground">
            {user.referral_points}
            <span className="text-base font-normal text-muted-foreground">
              /5
            </span>
          </span>
          <span className="text-sm text-muted-foreground mb-0.5">
            referal poena
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${(user.referral_points / MAX_REFERRAL_POINTS) * 100}%` }}
          />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Pozvao/la{" "}
            <span className="text-foreground font-semibold">
              {user.referrals.length}
            </span>{" "}
            igrača
          </span>
          <span className={remaining === 0 ? "text-muted-foreground" : "text-primary font-medium"}>
            {remaining === 0
              ? "Dostignut maksimum"
              : `Može još ${remaining} poziva`}
          </span>
        </div>

        {/* List of referred users */}
        {user.referrals.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Pozvani igrači:</p>
            <div className="flex flex-wrap gap-1.5">
              {user.referrals.map((r) => (
                <span
                  key={r.username}
                  className="text-xs bg-secondary px-2.5 py-1 rounded-full text-foreground"
                >
                  {r.username}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Points breakdown */}
      <div className="bg-card border border-border rounded-xl p-5">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          Poeni
        </span>
        <div className="flex items-center gap-3 mt-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{predictionPoints}</p>
            <p className="text-xs text-muted-foreground mt-0.5">tipovi</p>
          </div>
          <span className="text-muted-foreground text-lg font-light">+</span>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{user.referral_points}</p>
            <p className="text-xs text-muted-foreground mt-0.5">referal</p>
          </div>
          <span className="text-muted-foreground text-lg font-light">=</span>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{totalPoints}</p>
            <p className="text-xs text-muted-foreground mt-0.5">ukupno</p>
          </div>
        </div>
      </div>
    </div>
  );
}