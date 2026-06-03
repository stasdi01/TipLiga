import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNavBar from "@/components/admin-nav-bar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavBar />
      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}