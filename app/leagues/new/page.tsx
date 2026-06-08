import { requireUser } from "@/lib/session";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateLeagueForm } from "@/components/league-forms";

export default async function NewLeaguePage() {
  await requireUser();
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-4">
      <Card>
        <CardHeader>
          <CardTitle>Create a league</CardTitle>
          <CardDescription>
            You&apos;ll get an invite code to share once it&apos;s created.
          </CardDescription>
        </CardHeader>
        <CreateLeagueForm />
      </Card>
    </div>
  );
}
