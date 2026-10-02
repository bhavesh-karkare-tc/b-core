import { Button } from "@b-core/ui/components/button";
import { Card, CardLabel, CardTitle } from "@b-core/ui/components/card";
import { Chip } from "@b-core/ui/components/chip";
import { Progress } from "@b-core/ui/components/progress";

export default function HomePage() {
  return (
    <main className="flex flex-col gap-4 p-6">
      <Card>
        <CardLabel>B-Core</CardLabel>
        <CardTitle>Night Ice</CardTitle>
        <Progress value={25} aria-label="Arc progress" />
        <Chip tone="accent">Safe</Chip>
        <Button>Start</Button>
      </Card>
    </main>
  );
}
