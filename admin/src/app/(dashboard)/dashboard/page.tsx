'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/app/components/ui/card";
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  Activity,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  FolderKanban,
  Handshake
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabaseClient";
import Link from 'next/link';

// Helper function to format date to a relative time string
function timeAgo(date: Date | string) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " year" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " month" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " day" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hour" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minute" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
  return Math.floor(seconds) + " second" + (Math.floor(seconds) > 1 ? "s" : "") + " ago";
}

interface ActivityItem {
  id: string;
  type: "user" | "project";
  description: string;
  timestamp: string;
  icon: JSX.Element;
  href?: string;
}

export default function Dashboard() {
  const [entrepreneurCount, setEntrepreneurCount] = useState<number | null>(null);
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [matchCount, setMatchCount] = useState<number | null>(null);
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [projectMonthlyData, setProjectMonthlyData] = useState<number[]>(Array(12).fill(0));
  const [entrepreneurChange, setEntrepreneurChange] = useState<{ count: number; isIncrease: boolean } | null>(null);
  const [projectChange, setProjectChange] = useState<{ count: number; isIncrease: boolean } | null>(null);
  const [matchesThisMonth, setMatchesThisMonth] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const now = new Date();

        // --- Entrepreneurs --- 
        const { count: currentEntrepreneurCount, error: entrepreneurError } = await supabase
          .from("profiles")
          .select("id", { count: "exact", head: true });
        if (entrepreneurError) console.error("Error fetching entrepreneur count:", entrepreneurError);
        else setEntrepreneurCount(currentEntrepreneurCount);

        // Calculate entrepreneur change from last week
        if (currentEntrepreneurCount !== null) {
          const startOfThisWeek = new Date(now.setDate(now.getDate() - now.getDay()));
          startOfThisWeek.setHours(0, 0, 0, 0);
          const { count: entrepreneursLastWeek, error: entrepreneursLastWeekError } = await supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .lt("created_at", startOfThisWeek.toISOString());
          if (entrepreneursLastWeekError) console.error("Error fetching entrepreneurs last week:", entrepreneursLastWeekError);
          else if (entrepreneursLastWeek !== null) {
            const change = currentEntrepreneurCount - entrepreneursLastWeek;
            setEntrepreneurChange({ count: Math.abs(change), isIncrease: change >= 0 });
          }
        }

        // --- Projects --- 
        const { data: projectsData, count: currentProjectsCount, error: projectError } = await supabase
          .from("projects")
          .select("id, title, created_at", { count: "exact" })
          .order("created_at", { ascending: false });

        if (projectError) console.error("Error fetching projects:", projectError);
        else {
          setProjectCount(currentProjectsCount);

          // Process projects for monthly chart data
          const monthlyCounts = Array(12).fill(0);
          const currentYear = now.getFullYear();
          const currentMonth = now.getMonth();
          projectsData?.forEach(project => {
            if (project.created_at) {
              const projectDate = new Date(project.created_at);
              const monthDiff = (currentYear - projectDate.getFullYear()) * 12 + currentMonth - projectDate.getMonth();
              if (monthDiff >= 0 && monthDiff < 12) {
                monthlyCounts[11 - monthDiff]++;
              }
            }
          });
          setProjectMonthlyData(monthlyCounts.slice());
          console.log('Dashboard Chart: projectMonthlyData set to:', monthlyCounts.slice()); // DEBUG

          // Calculate project change from last month
          if (currentProjectsCount !== null) {
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            startOfThisMonth.setHours(0, 0, 0, 0);
            const { count: projectsLastMonth, error: projectsLastMonthError } = await supabase
              .from("projects")
              .select("id", { count: "exact", head: true })
              .lt("created_at", startOfThisMonth.toISOString());
            if (projectsLastMonthError) console.error("Error fetching projects last month:", projectsLastMonthError);
            else if (projectsLastMonth !== null) {
              const change = currentProjectsCount - projectsLastMonth;
              setProjectChange({ count: Math.abs(change), isIncrease: change >= 0 });
            }
          }
        }
        

        // --- Matches --- 
        try {
          const { count: currentMatchCount, error: matchError } = await supabase
            .from("matches")
            .select("id", { count: "exact", head: true });
          
          console.log('Current match count response:', { currentMatchCount, matchError });
          
          if (matchError) {
            console.error("Error fetching match count:", matchError);
            setMatchCount(0);
          } else {
            setMatchCount(currentMatchCount ?? 0);
          }

          const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          startOfThisMonth.setHours(0, 0, 0, 0);

          console.log('Date debug:', {
            now: now.toISOString(),
            startOfThisMonth: startOfThisMonth.toISOString()
          });

          // Calculate matches this month
          const { count: newMatchesThisMonth, error: matchesThisMonthError } = await supabase
            .from("matches")
            .select("id", { count: "exact", head: true })
            .gte("created_at", startOfThisMonth.toISOString());
          
          console.log('Matches this month response:', { 
            newMatchesThisMonth, 
            matchesThisMonthError,
            startOfThisMonth: startOfThisMonth.toISOString()
          });
          
          if (matchesThisMonthError) {
            console.error("Error fetching matches this month:", matchesThisMonthError);
            setMatchesThisMonth(0);
          } else {
            setMatchesThisMonth(newMatchesThisMonth ?? 0);
          }
        } catch (error) {
          console.error("Unexpected error in matches queries:", error);
          setMatchCount(0);
          setMatchesThisMonth(0);
        }
        
        
        

        // Fetch recent activities (ensure 'now' is reset if modified above)
        const freshNow = new Date(); // Use a fresh Date object for activity fetching if 'now' was modified
        const { data: recentUsers, error: usersError } = await supabase
          .from("profiles")
          .select("id, name, created_at")
          .order("created_at", { ascending: false })
          .limit(5);
        if (usersError) console.error("Error fetching recent users:", usersError);

        const { data: recentProjects, error: recentProjectsError } = await supabase
          .from("projects")
          .select("id, title, created_at")
          .order("created_at", { ascending: false })
          .limit(5);
        if (recentProjectsError) console.error("Error fetching recent projects:", recentProjectsError);

        const activities: ActivityItem[] = [];
        recentUsers?.forEach(user => {
          if (user.created_at) {
            activities.push({
              id: user.id,
              type: "user",
              description: `New user: ${user.name || "Unnamed"}`, 
              timestamp: user.created_at,
              icon: <Users className="h-4 w-4" />
            });
          }
        });
        recentProjects?.forEach(project => {
          if (project.created_at) {
            activities.push({
              id: project.id,
              type: "project",
              description: `New project: ${project.title || "Untitled"}`,
              timestamp: project.created_at,
              icon: <FolderKanban className="h-4 w-4" />,
              href: `/dashboard/projects/${project.id}`
            });
          }
        });

        activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRecentActivities(activities.slice(0, 5));

      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground mt-2">
          Here's an overview of the activity at UQ. 
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

        <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
            <CardTitle className="text-sm font-medium">Entrepreneurs</CardTitle>
            <div className="h-8 w-8 rounded-full bg-blue-100/80 dark:bg-blue-900/30 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{entrepreneurCount !== null ? `+${entrepreneurCount.toLocaleString()}` : "Loading..."}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              {entrepreneurChange ? (
                <>
                  {entrepreneurChange.isIncrease ? (
                    <ArrowUp className="mr-1 h-3 w-3 text-purple-500" />
                  ) : (
                    <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span className={`${entrepreneurChange.isIncrease ? 'text-purple-500' : 'text-red-500'} font-medium`}>
                    {entrepreneurChange.isIncrease ? '+' : '-'}{entrepreneurChange.count}
                  </span>
                  <span className="ml-1">from last week</span>
                </>
              ) : (
                <span>Loading change...</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <div className="h-8 w-8 rounded-full bg-amber-100/80 dark:bg-amber-900/30 flex items-center justify-center">
              <Activity className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount !== null ? projectCount.toLocaleString() : "Loading..."}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              {projectChange ? (
                <>
                  {projectChange.isIncrease ? (
                    <ArrowUp className="mr-1 h-3 w-3 text-purple-500" />
                  ) : (
                    <ArrowDown className="mr-1 h-3 w-3 text-red-500" />
                  )}
                  <span className={`${projectChange.isIncrease ? 'text-purple-500' : 'text-red-500'} font-medium`}>
                    {projectChange.isIncrease ? '+' : '-'}{projectChange.count}
                  </span>
                  <span className="ml-1">from last month</span>
                </>
              ) : (
                <span>Loading change...</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
            <CardTitle className="text-sm font-medium">Matches</CardTitle>
            <div className="h-8 w-8 rounded-full bg-green-100/80 dark:bg-green-900/30 flex items-center justify-center">
              <Handshake className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div >
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matchCount !== null ? matchCount.toLocaleString() : "Loading..."}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center">
              {matchesThisMonth !== null ? (
                <>
                  <ArrowUp className="mr-1 h-3 w-3 text-purple-500" />
                  <span className="text-purple-500 font-medium">+{matchesThisMonth}</span>
                  <span className="ml-1">this month</span>
                </>
              ) : (
                <span>Loading matches...</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800 md:col-span-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Projects</CardTitle>
                <CardDescription className="mt-1">
                  Projects at UQ
                </CardDescription>
              </div>

            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="mt-3 h-[240px] w-full">
              <div className="flex items-end justify-between h-full w-full px-2">
                {projectMonthlyData.map((count, i) => {
                  const maxCount = Math.max(...projectMonthlyData, 1); // Avoid division by zero if all counts are 0
                  const height = (count / maxCount) * 100; // Calculate height as percentage of max
                  const currentMonth = new Date().getMonth();
                  const monthIndex = (currentMonth - (11 - i) + 12) % 12; // Calculate month index for label

                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div 
                        className="w-8 bg-purple-100 dark:bg-purple-900/40 rounded-t-sm relative group"
                        style={{ height: `${height}%` }} // Use calculated height
                      >
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          {count} project{count !== 1 ? 's' : ''} {/* Display actual project count */}
                        </div>
                        <div className="absolute inset-0 bg-purple-500/40 dark:bg-purple-500/60 rounded-t-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                      </div>
                      <span className="text-xs text-muted-foreground mt-2">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthIndex]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-md bg-white dark:bg-gray-800 md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest actions across your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.length > 0 ? recentActivities.map((activity) => {
                const content = (
                  <div className="flex items-start gap-4 p-3 transition-colors hover:bg-muted/50 rounded-lg">
                    <div className="mt-1 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-600 dark:to-purple-800 flex items-center justify-center text-white">
                      {activity.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{timeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                );

                if (activity.type === "project" && activity.href) {
                  return (
                    <Link key={activity.id} href={activity.href} passHref legacyBehavior>
                      <a className="block rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                        {content}
                      </a>
                    </Link>
                  );
                } else {
                  return (
                    <div key={activity.id}>
                      {content}
                    </div>
                  );
                }
              }) : (
                <p className="text-sm text-muted-foreground">No recent activity to display.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 