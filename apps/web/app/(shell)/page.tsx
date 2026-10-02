import { PageHeader } from "@/components/shell/page-header";
import { WinterArcCard } from "@/features/winter-arc/home/winter-arc-card";

export default function HomePage() {
  return (
    <>
      <PageHeader eyebrow="B-Core" title="Home" />
      <WinterArcCard />
    </>
  );
}
