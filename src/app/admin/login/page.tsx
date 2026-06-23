import Link from "next/link";
import { AlertTriangle, LockKeyhole } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeReadServerEnv } from "@/lib/environment/env";

export default function AdminLoginPage({
  searchParams
}: {
  searchParams: {
    error?: string;
  };
}) {
  const env = safeReadServerEnv();
  const missingSecrets = !env.success;

  return (
    <section className="mx-auto flex max-w-md flex-col gap-6 py-12">
      <Badge className="w-fit">Private admin</Badge>
      <Card>
        <CardHeader>
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/30 bg-accent-soft text-accent">
            <LockKeyhole className="h-6 w-6" />
          </div>
          <CardTitle>Admin login</CardTitle>
          <CardDescription>
            Sign in with the shared admin password to manage crossword imports, draft content, and publishing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {missingSecrets ? (
            <div className="rounded-xl border border-error/30 bg-error/10 p-4 text-sm leading-6 text-text">
              `ADMIN_PASSWORD` and `SESSION_SECRET` must be configured before admin login can succeed.
            </div>
          ) : null}
          {searchParams.error ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-text">
              <AlertTriangle className="h-4 w-4" />
              Incorrect password. Try again.
            </div>
          ) : null}
          <form action="/api/admin/login" method="post" className="space-y-4">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="current-password" required />
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
          <Button asChild={false} variant="ghost" className="w-full">
            <Link href="/">Back home</Link>
          </Button>
        </CardContent>
      </Card>
    </section>
  );
}

