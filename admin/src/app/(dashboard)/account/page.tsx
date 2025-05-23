import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/app/components/ui/card";

export default function AccountPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and profile information.
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            View and update your personal details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Email</h3>
              <p className="text-sm text-muted-foreground">admin@example.com</p>
            </div>
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Name</h3>
              <p className="text-sm text-muted-foreground">Admin User</p>
            </div>
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Role</h3>
              <p className="text-sm text-muted-foreground">Administrator</p>
            </div>
            <div className="grid gap-2">
              <h3 className="text-sm font-medium">Last Login</h3>
              <p className="text-sm text-muted-foreground">Today at 12:30 PM</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 