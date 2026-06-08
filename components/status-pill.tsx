import { Badge } from "@/components/ui/badge";

export function StatusPill({ status }: { status: "SCHEDULED" | "LIVE" | "FINISHED" }) {
  if (status === "LIVE") {
    return (
      <Badge variant="live">
        <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-danger" />
        LIVE
      </Badge>
    );
  }
  if (status === "FINISHED") {
    return <Badge variant="default">FULL TIME</Badge>;
  }
  return <Badge variant="accent">UPCOMING</Badge>;
}
