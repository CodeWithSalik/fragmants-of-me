export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl font-serif">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <div className="aura-card reading-mode p-8 space-y-6 text-sm text-ink/80 leading-relaxed">
        <section>
          <h2 className="text-lg font-bold text-ink mb-2">1. Information We Collect</h2>
          <p>We collect your name and email address when you register or apply as an author. We also use Firebase Authentication and Firestore to store your profile and contributions.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-ink mb-2">2. Google AdSense & Cookies</h2>
          <p>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this or other websites. Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site. You may opt out of personalized advertising by visiting Google Ad Settings.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold text-ink mb-2">3. Data Security</h2>
          <p>We use industry-standard security measures provided by Google Firebase to protect your personal data from unauthorized access.</p>
        </section>
        <p className="text-xs text-muted pt-4 italic">Last Updated: January 31, 2026</p>
      </div>
    </div>
  );
}