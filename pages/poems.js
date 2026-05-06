import SeoHead from "@/components/SeoHead";
import EntryTypePage from "@/components/EntryTypePage";

export default function Poems() {
  return (
    <>
      <SeoHead title="Poems" path="/poems" />
      <EntryTypePage
        title="Poetry Collection"
        subtitle="Verses written in silence."
        type="poem"
        emptyTitle="No poems found."
      />
    </>
  );
}
