import Head from "next/head";

export default function About() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <Head><title>About | Fragmants of Me</title></Head>
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-serif font-black text-ink mb-4">The Story</h1>
        <p className="text-muted italic">Why Fragmants of Me exists.</p>
      </div>

      <div className="aura-card reading-mode">
        <div className="aura-card-content p-10 md:p-14 space-y-8 text-lg leading-relaxed font-serif">
          <p>
            <span className="text-accent font-bold">Fragmants of Me</span> is a digital sanctuary for the unsaid. 
            In a world of constant noise, this platform serves as a curated collection of poems, 
            monologues, and quiet confessions.
          </p>
          <p>
            Our mission is to provide a minimalist, "premium paper" experience for writers and readers 
            who value depth over distraction. Every entry here is a fragment of a larger human 
            experience—written to be <span className="italic">felt</span> rather than just consumed.
          </p>
          <div className="pt-8 border-t border-black/5">
            <h2 className="text-xl font-bold text-ink mb-4">Originality & Quality</h2>
            <p className="text-sm text-muted">
              We uphold strict standards for original content. Every piece published on this platform 
              is crafted by our community of authors or the founding editor, Pirzada Salik. We do not 
              tolerate scraped or AI-generated content that lacks human resonance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}