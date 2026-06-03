export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-48 bg-secondary rounded-lg" />
      <div className="h-40 bg-card border border-border rounded-xl" />
      <div className="h-64 bg-card border border-border rounded-xl" />
    </div>
  );
}