import Head from "next/head";

export default function Terms() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl font-serif">
      <Head>
        <title>Terms & Conditions | Fragments of Me</title>
      </Head>
      
      <h1 className="text-3xl font-bold mb-8 text-ink">Terms & Conditions</h1>
      
      <div className="aura-card reading-mode">
        <div className="aura-card-content p-8 space-y-6 text-sm text-ink/80 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-ink mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing Fragments of Me, you agree to be bound by these terms. If you do not agree, please do not use the service.
            </p>
          </section>
          
          <section>
            <h2 className="text-lg font-bold text-ink mb-2">2. Intellectual Property</h2>
            <p>
              All content, including poems and monologues, remains the intellectual property of the respective authors or Pirzada Salik. 
              You may not reproduce, redistribute, or sell any content without explicit permission.
            </p>
          </section>
          
          <section>
            <h2 className="text-lg font-bold text-ink mb-2">3. Prohibited Behavior</h2>
            <p>
              Users are prohibited from using automated scripts or bots to scrape content. 
              Harassment in comment sections will result in immediate account termination.
            </p>
          </section>
          
          <div className="pt-4 border-t border-black/5">
            <p className="text-xs text-muted italic">Last Updated: January 31, 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}