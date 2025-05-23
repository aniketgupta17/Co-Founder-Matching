import { MatchesTable } from "@/src/app/components/matches-table";

export default function MatchesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Matches</h1>
        <p className="text-muted-foreground mt-2">
          Manage matches between entrepreneurs and projects.
        </p>
      </div>
      <MatchesTable />
    </div>
  );
}

