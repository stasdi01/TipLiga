import { prisma } from "@/lib/prisma";
import { Users, DollarSign, Star } from "lucide-react";

const ENTRY_FEE = 1500;
const ADMIN_CUT = 500;
const PRIZE_POOL_PER_USER = 1000;

async function getOverviewData() {
  const [users, topReferrer] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        username: true,
        status: true,
        referrals: { select: { id: true } },
      },
    }),
    prisma.user.findFirst({
      where: { status: "ACTIVE" },
      orderBy: { referral_points: "desc" },
      select: { username: true, referral_points: true, referrals: { select: { id: true } } },
    }),
  ]);

  const total = users.length;
  const active = users.filter((u) => u.status === "ACTIVE").length;
  const totalCollected = active * ENTRY_FEE;
  const adminCut = active * ADMIN_CUT;
  const prizePool = active * PRIZE_POOL_PER_USER;

  return { total, active, totalCollected, adminCut, prizePool, topReferrer };
}

function StatCard({
  label,
  value,
  sub,
  icon,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-card border rounded-xl p-4 ${highlight ? "border-primary/40" : "border-border"}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${highlight ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function fmt(n: number) {
  return n.toLocaleString("sr-RS") + " RSD";
}

export default async function AdminPage() {
  const { total, active, totalCollected, adminCut, prizePool, topReferrer } =
    await getOverviewData();

  const prize1 = Math.round(prizePool * 0.65);
  const prize2 = Math.round(prizePool * 0.25);
  const prize3 = Math.round(prizePool * 0.10);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">Pregled</h1>

      {/* Users */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Ukupno igrača"
          value={String(total)}
          icon={<Users size={14} />}
        />
        <StatCard
          label="Aktivnih"
          value={String(active)}
          sub={`${total - active} neaktivnih`}
          icon={<Users size={14} />}
          highlight
        />
      </div>

      {/* Money */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <DollarSign size={15} className="text-muted-foreground" />
          Finansije
        </h2>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-foreground">{fmt(totalCollected)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Ukupno naplaćeno</p>
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">{fmt(adminCut)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tvoj deo</p>
          </div>
          <div>
            <p className="text-lg font-bold text-primary">{fmt(prizePool)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Nagradni fond</p>
          </div>
        </div>

        <div className="border-t border-border pt-4 space-y-2">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-3">
            Raspodela nagrada
          </p>
          {[
            { place: "1. mesto", pct: "65%", amount: prize1 },
            { place: "2. mesto", pct: "25%", amount: prize2 },
            { place: "3. mesto", pct: "10%", amount: prize3 },
          ].map(({ place, pct, amount }) => (
            <div key={place} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{place}</span>
              <span className="text-xs text-muted-foreground">{pct}</span>
              <span className="font-semibold text-foreground">{fmt(amount)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between text-sm border-t border-border pt-2 mt-2">
            <span className="text-muted-foreground">Top referrer bonus</span>
            <span className="text-xs text-muted-foreground">iz tvog dela</span>
            <span className="font-semibold text-foreground">1.000 RSD</span>
          </div>
        </div>
      </div>

      {/* Top referrer */}
      {topReferrer && topReferrer.referrals.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
            <Star size={14} className="text-primary" />
            Top referrer
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">{topReferrer.username}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {topReferrer.referrals.length} pozvanih igrača ·{" "}
                {topReferrer.referral_points} referal poena
              </p>
            </div>
            <span className="text-2xl">🏆</span>
          </div>
        </div>
      )}
    </div>
  );
}