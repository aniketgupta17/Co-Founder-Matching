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
import { Search, MoreHorizontal, ChevronLeft, ChevronRight, UserPlus, Download, Loader2 } from "lucide-react";

// Use dicebear to generate avatar URL with unique seed for consistent images
const getDiceBearAvatarUrl = (seed: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

interface User {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl: string;
  status: "active" | "pending" | "banned";
  role: string | null;
  joinedDate: string | null;
  lastLogin: string | null;
  users?: {
    role?: string | null;
    last_sign_in_at?: string | null;
    email_confirmed_at?: string | null;
    banned_until?: string | null;
  } | null;
}

const ITEMS_PER_PAGE = 10;

export function UsersTable() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: supabaseError } = await supabase
        .from("profiles") 
        .select(`
          id,
          name,
          email,
          avatar_url,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      const formattedUsers: User[] = data
        ? data.map((profile: any) => {
            return {
              id: profile.id,
              name: profile.name || "N/A",
              email: profile.email,
              avatarUrl: profile.avatar_url || getDiceBearAvatarUrl(profile.id || profile.email || 'default'),
              status: "active", // Default to active, or adjust as needed
              role: "user", // Default to user, or adjust as needed
              joinedDate: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A",
              lastLogin: "N/A", // No lastLogin info in profiles
            };
          })
        : [];
      setUsers(formattedUsers);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to fetch users. Please check your Supabase connection and table name.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId: string, userName: string | null) => {
    if (window.confirm(`Are you sure you want to delete user "${userName || 'Unknown'}"? This action cannot be undone.`)) {
      try {
        setLoading(true); // Optional: show loading state during delete
        const { error: deleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', userId);

        if (deleteError) {
          throw deleteError;
        }

        // Refresh user list after deletion
        // Option 1: Refetch all users
        await fetchUsers(); 
        // Option 2: More optimistically, remove from local state
        // setUsers(currentUsers => currentUsers.filter(user => user.id !== userId));
        // setCurrentPage(1); // Reset to first page or adjust as needed
        
        // Consider adding a success notification here
        console.log(`User ${userId} deleted successfully.`);

      } catch (err: any) {
        console.error("Error deleting user:", err);
        setError(err.message || "Failed to delete user.");
        // Consider adding an error notification here
      } finally {
        setLoading(false); // Optional: hide loading state
      }
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Paginate the filtered users
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const statusColors = {
    active: "bg-purple-500",
    pending: "bg-amber-500",
    banned: "bg-rose-500",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-rose-500/50 shadow-md bg-rose-50 dark:bg-rose-900/20">
        <CardHeader>
          <CardTitle className="text-rose-700 dark:text-rose-400">Error Loading Users</CardTitle>
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
            <CardTitle>All Users</CardTitle>
            <CardDescription className="mt-1">
              A list of all users from Supabase.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
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
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <TableRow 
                    key={user.id} 
                    className="hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/users/${user.id}`)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-9 w-9 rounded-full overflow-hidden bg-gradient-to-r from-sky-500 to-indigo-500">
                          <img
                            src={user.avatarUrl}
                            alt={user.name || "User Avatar"}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{user.name || "Unknown User"}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusColors[user.status]}`}></div>
                        <Badge variant={user.status === "active" ? "default" : user.status === "pending" ? "outline" : "destructive"} className="capitalize">
                          {user.status}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`capitalize font-medium ${
                          user.role === "admin" 
                            ? "text-rose-500 border-rose-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-800" 
                            : user.role === "editor"
                            ? "text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800"
                            : "text-sky-500 border-sky-200 bg-sky-50 dark:bg-sky-950/20 dark:border-sky-800"
                        }`}
                      >
                        {user.role || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{user.joinedDate}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{user.lastLogin}</TableCell>
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
                          <DropdownMenuItem>View profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit user</DropdownMenuItem>
                          <DropdownMenuItem>Permissions</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive hover:!bg-destructive/10 hover:!text-destructive"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              handleDeleteUser(user.id, user.name);
                            }}
                          >
                            Delete user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {searchQuery ? "No users match your search." : "No users found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-3">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}
              </span>{" "}
              of <span className="font-medium">{filteredUsers.length}</span> users
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