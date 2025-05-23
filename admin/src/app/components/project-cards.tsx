"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/app/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/app/components/ui/dropdown-menu";
import { Button } from "@/src/app/components/ui/button";
import { Input } from "@/src/app/components/ui/input";
import { Badge } from "@/src/app/components/ui/badge";
import { 
  Search, 
  MoreHorizontal, 
  Calendar, 
  Users, 
  Plus,
  Briefcase, // Default icon
  AlertTriangle, // For error state
  Loader2, // For loading state
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const DEFAULT_ICON = Briefcase;
const DEFAULT_ICON_COLOR = 'bg-slate-500';

interface Project {
  id: string;
  title: string | null;
  description: string | null;
  industry: string | null;
  created_at: string | null;
  budget: string;
  dueDate: string;
  assignees: number;
  creator_id?: string; 
}

const ITEMS_PER_PAGE = 9;

export function ProjectCards() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from("projects")
          .select("id, title, description, industry, created_at, creator_id")
          .order("created_at", { ascending: false });

        if (supabaseError) {
          throw supabaseError;
        }

        const formattedProjects: Project[] = data
          ? data.map((proj: any) => {
              return {
                id: proj.id,
                title: proj.title || "Untitled Project",
                description: proj.description || "No description available.",
                industry: proj.industry || "General",
                created_at: proj.created_at,
                creator_id: proj.creator_id,
                budget: proj.budget || `$${(Math.floor(Math.random() * 50) + 10) * 1000}`,
                dueDate: proj.created_at ? new Date(proj.created_at).toLocaleDateString() : new Date(Date.now() + Math.floor(Math.random() * 10000000000)).toLocaleDateString(),
                assignees: proj.assignees || Math.floor(Math.random() * 5) + 1,
              };
            })
          : [];
        setProjects(formattedProjects);
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError(err.message || "Failed to fetch projects.");
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      (project.title && project.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (project.industry && project.industry.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesSearch; // Only search based
  });

  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-rose-500/50 shadow-md bg-rose-50 dark:bg-rose-900/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
            <CardTitle className="text-rose-700 dark:text-rose-400">Error Loading Projects</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">
            Supabase error.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects by title, desc, industry..."
            className="pl-8 w-full bg-background"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="flex gap-2">
          {/* Filter and Sort buttons can be added back if needed */}
          <Button className="gap-1">
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {paginatedProjects.length > 0 ? (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedProjects.map((project) => {
              const Icon = DEFAULT_ICON; // Use default icon
              return (
                <Card key={project.id} className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800 hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader className="relative pb-2">

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`h-7 w-7 rounded-md flex items-center justify-center ${DEFAULT_ICON_COLOR} text-white shadow-sm`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <Badge
                          variant="outline"
                          className="text-xs capitalize border-dashed"
                        >
                          {project.industry || 'General'} {/* Display industry */}
                        </Badge>
                      </div>
                      <CardTitle className="line-clamp-1 text-base font-semibold">{project.title}</CardTitle>
                      {/* <CardDescription className="mt-1 text-xs text-muted-foreground">Project ID: {project.id.substring(0,8)}...</CardDescription> */} {/* Removed Project ID */}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-4">
                      {project.description}
                    </p>
                    
                  </CardContent>
                  <CardFooter className="border-t bg-muted/20 dark:bg-gray-800/30 px-4 py-3">
                    <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Started: {project.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        <span>{project.assignees} member{project.assignees !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-center mt-8 space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                Last
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-md shadow-sm border border-dashed">
          <div className="flex flex-col items-center gap-4">
            <Briefcase className="h-12 w-12 text-muted-foreground/50" />
            <div>
              <h3 className="font-semibold text-lg text-foreground">No projects match your criteria</h3>
              <p className="text-muted-foreground text-sm mt-1">Try adjusting your search.</p> {/* Updated message */}
            </div>
            <Button className="mt-2" variant="outline" onClick={() => {
              setSearchQuery('');
              setCurrentPage(1);
            }}>
              Clear Search
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 