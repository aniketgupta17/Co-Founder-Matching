import { ProjectCards } from "@/src/app/components/project-cards";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all your active projects.
        </p>
      </div>
      <ProjectCards />
    </div>
  );
} 
