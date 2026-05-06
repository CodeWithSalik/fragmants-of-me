import SeoHead from "@/components/SeoHead";
import EntryTypePage from "@/components/EntryTypePage";

export default function Diary() {
  return (
    <>
      <SeoHead title="Diary" path="/diary" />
      <EntryTypePage
        title="Diary Entries"
        subtitle="Quiet confessions and daily thoughts."
        type="diary"
        emptyTitle="The pages are empty."
      />
    </>
  );
}
