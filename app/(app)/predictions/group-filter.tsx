"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function GroupFilter({ groups }: { groups: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("group") ?? "sve";

  function select(group: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (group === "sve") params.delete("group");
    else params.set("group", group);
    router.replace(`/predictions?${params.toString()}`, { scroll: false });
  }

  const all = ["sve", ...groups];

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {all.map((g) => (
        <button
          key={g}
          onClick={() => select(g)}
          className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] ${
            active === g
              ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(245,197,24,0.35)]"
              : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
          }`}
        >
          {g === "sve" ? "Sve" : g}
        </button>
      ))}
    </div>
  );
}