import SeoHead from "@/components/SeoHead";
import EntryTypePage from "@/components/EntryTypePage";

export default function Monologues() {
  return (
    <>
      <SeoHead title="Monologues" path="/monologues" />
      <EntryTypePage
        title="Monologues"
        subtitle="Unspoken words given a voice."
        type="monologue"
        emptyTitle="Silence fills the room."
      />
    </>
  );
}
