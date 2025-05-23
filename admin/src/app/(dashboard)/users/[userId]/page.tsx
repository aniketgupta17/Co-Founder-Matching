import { supabase } from "@/src/lib/supabaseClient";
import Link from "next/link";
import { ArrowLeft, Mail, CalendarDays, ShieldCheck, Clock, UserCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/src/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/app/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/app/components/ui/avatar";

const getDiceBearAvatarUrl = (seed: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  avatarUrl: string;
  status: "active" | "pending" | "banned";
  role: string | null;
  joinedDate: string | null;
  lastLogin: string | null;
  bio: string | null;
  seeking_skills?: string | null;
  industry?: string | null;
  time_commitment?: string | null;
  location?: string | null;
  availability?: string | null;
  startup_stage?: string | null;
  collab_style?: string | null;
  skills?: string | null;
}

async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      id,
      name,
      email,
      avatar_url,
      bio,
      created_at,
      seeking_skills,
      industry,
      time_commitment,
      location,
      availability,
      startup_stage,
      collab_style,
      skills,
      role
    `)
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  let status: UserProfile["status"] = "active";

  return {
    id: data.id,
    name: data.name || "N/A",
    email: data.email,
    avatarUrl: data.avatar_url || getDiceBearAvatarUrl(data.id || data.email || 'default'),
    status,
    role: data.role || "user",
    joinedDate: data.created_at ? new Date(data.created_at).toLocaleDateString() : "N/A",
    lastLogin: "N/A",
    bio: data.bio || "No bio available.",
    seeking_skills: data.seeking_skills,
    industry: data.industry,
    time_commitment: data.time_commitment,
    location: data.location,
    availability: data.availability,
    startup_stage: data.startup_stage,
    collab_style: data.collab_style,
    skills: data.skills,
  };
}

interface StatusDetail {
  label: string;
  color: string;
  icon: React.ElementType;
}

const statusDetails: Record<UserProfile["status"], StatusDetail> = {
  active: { label: "Active", color: "text-green-500", icon: ShieldCheck },
  pending: { label: "Pending", color: "text-yellow-500", icon: Clock },
  banned: { label: "Banned", color: "text-red-500", icon: AlertTriangle },
};


export default async function UserProfilePage({ params }: { params: { userId: string } }) {
  const user = await getUserProfile(params.userId);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <UserCircle className="w-24 h-24 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-semibold mb-2">User Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The user profile you are looking for does not exist or could not be loaded.
        </p>
        <Link href="/users" className="text-primary hover:underline flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users List
        </Link>
      </div>
    );
  }
  
  const UserStatusIcon = statusDetails[user.status].icon;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/users" className="text-sm text-primary hover:underline flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users List
        </Link>
      </div>

      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-muted/30 p-6 border-b">
          <div className="flex items-center space-x-4">
            <Avatar className="h-24 w-24 border-4 border-background shadow-sm">
              <AvatarImage src={user.avatarUrl} alt={user.name || "User Avatar"} />
              <AvatarFallback className="text-2xl">
                {user.name ? user.name.charAt(0).toUpperCase() : <UserCircle size={40}/>}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
              <CardDescription className="text-lg text-muted-foreground">{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-3">User Details</h3>
              <div className="flex items-center">
                <ShieldCheck className="h-5 w-5 mr-3 text-muted-foreground" />
                <span className="font-medium">Role:</span>
                <Badge variant="outline" className="ml-2 capitalize">{user.role}</Badge>
              </div>
              <div className="flex items-center">
                <UserStatusIcon className={`h-5 w-5 mr-3 ${statusDetails[user.status].color}`} />
                <span className="font-medium">Status:</span>
                 <Badge 
                  variant={user.status === "active" ? "default" : user.status === "pending" ? "outline" : "destructive"}
                  className="ml-2 capitalize"
                >
                  {statusDetails[user.status].label}
                </Badge>
              </div>
              <div className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-3 text-muted-foreground" />
                <span className="font-medium">Joined:</span>
                <span className="ml-2 text-muted-foreground">{user.joinedDate}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-muted-foreground" />
                <span className="font-medium">Last Login:</span>
                <span className="ml-2 text-muted-foreground">{user.lastLogin}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-3">Contact Information</h3>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                <span className="font-medium">Email:</span>
                <a href={`mailto:${user.email}`} className="ml-2 text-primary hover:underline">{user.email}</a>
              </div>
            </div>
          </div>

          {/* Additional Details Section */}
          <div>
            <h3 className="text-xl font-semibold mb-2">Additional Details</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><span className="font-medium text-foreground">Seeking Skills:</span> {user.seeking_skills || "N/A"}</li>
              <li><span className="font-medium text-foreground">Industry:</span> {user.industry || "N/A"}</li>
              <li><span className="font-medium text-foreground">Time Commitment:</span> {user.time_commitment || "N/A"}</li>
              <li><span className="font-medium text-foreground">Location:</span> {user.location || "N/A"}</li>
              <li><span className="font-medium text-foreground">Availability:</span> {user.availability || "N/A"}</li>
              <li><span className="font-medium text-foreground">Startup Stage:</span> {user.startup_stage || "N/A"}</li>
              <li><span className="font-medium text-foreground">Collab Style:</span> {user.collab_style || "N/A"}</li>
              <li><span className="font-medium text-foreground">Skills:</span> {user.skills || "N/A"}</li>
            </ul>
          </div>

          {user.bio && (
            <div>
              <h3 className="text-xl font-semibold mb-2">Bio</h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{user.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Basic loading component (optional, Next.js might handle this with Suspense)
export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
      <p className="text-lg text-muted-foreground">Loading user profile...</p>
    </div>
  );
} 