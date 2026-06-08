import { requireUser } from "@/lib/session";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { JoinLeagueForm } from "@/components/league-forms";

export default async function JoinLeaguePage() {
  await requireUser();
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-4">
      <Card>
        <CardHeader>
          <CardTitle>Join a league</CardTitle>
          <CardDescription>Enter the 6-character invite code.</CardDescription>
        </CardHeader>
        <JoinLeagueForm />
      </Card>
    </div>
  );
}
