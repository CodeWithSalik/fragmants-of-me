import SeoHead from "@/components/SeoHead";
import EntryTypePage from "@/components/EntryTypePage";

export default function Perspectives() {
  return (
    <>
      <SeoHead title="Perspectives" path="/perspectives" />
      <EntryTypePage
        title="Perspectives"
        subtitle="Thoughts, articles, and different angles of view."
        type="perspective"
        emptyTitle="A blank canvas..."
        emptySubtitle="No perspectives shared yet."
        accentClass="bg-slate-900/30 dark:bg-slate-400/30"
      />
    </>
  );
}
