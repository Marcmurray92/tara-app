import Link from "next/link";
import { ArrowLeft, Clock3, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ComingSoon({
  title,
  description,
  eyebrow
}: {
  title: string;
  description: string;
  eyebrow: string;
}) {
  return (
    <section className="mx-auto max-w-3xl py-10">
      <Card className="overflow-hidden">
        <CardHeader className="space-y-5">
          <Badge className="w-fit">Coming soon</Badge>
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-accent/30 bg-accent-soft text-accent">
            <Clock3 className="h-8 w-8" />
          </div>
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.28em] text-muted">{eyebrow}</p>
            <CardTitle className="text-4xl">{title}</CardTitle>
            <CardDescription className="text-base leading-7">{description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm leading-7 text-muted">
            The route is live on purpose, so the shared shell, navigation, future content model, and deployment path can
            all be exercised now without pretending the gameplay already exists.
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild={false}>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back home
              </Link>
            </Button>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 px-4 py-2 text-sm text-muted">
              <Sparkles className="h-4 w-4 text-accent" />
              Built on the same shared architecture as the crossword phase
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

