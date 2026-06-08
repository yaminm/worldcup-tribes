import { redirect } from "next/navigation";
import { Trophy } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { SignInForm } from "@/components/sign-in-form";
import { Card } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const safeCallback =
    callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
      ? callbackUrl
      : "/";

  const user = await getCurrentUser();
  if (user) redirect(safeCallback);

  const googleEnabled = Boolean(
    process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET,
  );
  const devEnabled = process.env.ENABLE_DEV_LOGIN === "true";

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <Trophy className="h-8 w-8 text-accent" />
        <h1 className="text-2xl font-extrabold tracking-tight">
          Sign in to Tribes
        </h1>
        <p className="text-sm text-muted">
          Predict the World Cup with your friends.
        </p>
      </div>
      <Card>
        <SignInForm
          googleEnabled={googleEnabled}
          devEnabled={devEnabled}
          callbackUrl={safeCallback}
        />
      </Card>
    </div>
  );
}
