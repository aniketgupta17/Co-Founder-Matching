"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/src/lib/supabaseClient";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/app/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/app/components/ui/card";
import { Input } from "@/src/app/components/ui/input";
import { Button } from "@/src/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/app/components/ui/dropdown-menu";
import { Badge } from "@/src/app/components/ui/badge";
import { Search, MoreHorizontal, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Match {
  id: string;
  user_id: string;
  matched_user_id: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

export function MatchesTable() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: supabaseError } = await supabase
          .from("matches")
          .select(`
            id,
            user_id,
            matched_user_id,
            created_at
          `)
          .order("created_at", { ascending: false });

        if (supabaseError) {
          throw supabaseError;
        }

        // Transform the data to match our interface
        const formattedMatches: Match[] = (data || []).map((match: any) => ({
          id: match.id,
          user_id: match.user_id,
          matched_user_id: match.matched_user_id,
          created_at: match.created_at,
        }));

        setMatches(formattedMatches);
      } catch (err: any) {
        console.error("Error fetching matches:", err);
        setError(err.message || "Supabase error");
      }
      setLoading(false);
    };

    fetchMatches();
  }, []);

  // Filter matches based on search query
  const filteredMatches = matches.filter(
    (match) =>
      match.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.matched_user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.created_at.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate the filtered matches
  const paginatedMatches = filteredMatches.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredMatches.length / ITEMS_PER_PAGE);

  const statusColors = {
    pending: "bg-amber-500",
    accepted: "bg-green-500",
    rejected: "bg-rose-500",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-rose-500/50 shadow-md bg-rose-50 dark:bg-rose-900/20">
        <CardHeader>
          <CardTitle className="text-rose-700 dark:text-rose-400">Error Loading Matches</CardTitle>
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
    <Card className="border-none shadow-md bg-white dark:bg-gray-800">
      <CardHeader>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <CardTitle>All Matches</CardTitle>
            <CardDescription className="mt-1">
              A list of all matches between users.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search matches..."
                className="pl-8 w-full min-w-[240px] bg-background"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[200px]">User</TableHead>
                <TableHead className="w-[200px]">Matched User</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMatches.length > 0 ? (
                paginatedMatches.map((match) => (
                  <TableRow 
                    key={match.id} 
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/matches/${match.id}`)}
                  >
                    <TableCell>
                      <div 
                        className="font-medium hover:text-primary cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          router.push(`/users/${match.user_id}`);
                        }}
                      >
                        {match.user_id}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div 
                        className="font-medium hover:text-primary cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          router.push(`/users/${match.matched_user_id}`);
                        }}
                      >
                        {match.matched_user_id}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {match.created_at ? new Date(match.created_at).toLocaleDateString() : "N/A"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Edit match</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">Delete match</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {searchQuery ? "No matches match your search." : "No matches found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredMatches.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredMatches.length)}
              </span>{" "}
              of <span className="font-medium">{filteredMatches.length}</span> matches
            </div>
            <nav className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="hidden sm:flex"
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
                <span className="sr-only">Previous page</span>
              </Button>
              <div className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="hidden sm:flex"
              >
                Last
              </Button>
            </nav>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
