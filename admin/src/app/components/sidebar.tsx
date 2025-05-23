"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart2, 
  Users, 
  FolderKanban, 
  LogOut, 
  User,
  LucideIcon,
  Handshake
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart2,
  },
  {
    title: "Users",
    href: "/users",
    icon: Users,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    title: "Matches",
    href: "/matches",
    icon: Handshake,
  },
];

const bottomNavItems: NavItem[] = [
  {
    title: "Account",
    href: "/account",
    icon: User,
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-full border-r border-gray-200 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 flex flex-col shadow-sm">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">UQ Ventures Admin</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-8">
        <div className="space-y-1">
          <div className="mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Menu
          </div>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors duration-200 ${
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-medium"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50"
              }`}
            >
              <item.icon className={`w-5 h-5 ${
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "text-purple-500" 
                  : "text-gray-500"
              }`} />
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-800 space-y-1 mt-auto">
        <div className="mb-2 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Account
        </div>


        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors duration-200 mt-2">
          <LogOut className="w-5 h-5 text-gray-500" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
} 