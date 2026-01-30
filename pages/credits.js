import Head from "next/head";
import Link from "next/link";

export default function Credits() {
  return (
    <div className="container mx-auto px-4 py-20 max-w-3xl">
      <Head><title>Credits | Fragments of Me</title></Head>

      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-black text-ink mb-4">Credits</h1>
        <p className="text-muted italic">Acknowledging the art and the code.</p>
      </div>

      <div className="aura-card reading-mode">
        <div className="aura-card-content p-10 md:p-14 space-y-12">
          
          {/* Section 1: Code */}
          <div>
            <h2 className="text-xl font-bold text-ink mb-6 border-b border-black/10 dark:border-white/10 pb-2">Concept & Code</h2>
            <p className="text-muted leading-relaxed mb-4">
              Designed and developed by <span className="text-ink font-bold">Pirzada Salik</span>.
              <br/>Built with Next.js, Tailwind CSS, and Firebase.
            </p>
          </div>

          {/* Section 2: Music */}
          <div>
            <h2 className="text-xl font-bold text-ink mb-6 border-b border-black/10 dark:border-white/10 pb-2">Soundscapes</h2>
            <div className="space-y-8 text-sm text-muted">
              
              <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
                <p className="text-ink font-bold text-lg mb-1">In Memoriam</p>
                <p className="mb-1">Composer: <a href="https://www.youtube.com/channel/UCNQ6vKZ5ogEZ0tM2TvxLhQA" target="_blank" rel="noreferrer" className="underline hover:text-accent">Onycs</a></p>
                <p className="text-xs opacity-80">License: Creative Commons (BY 3.0)</p>
              </div>

              <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
                <p className="text-ink font-bold text-lg mb-1">Helen 2</p>
                <p className="mb-1">Composer: <a href="https://www.youtube.com/user/nikospiliotis/videos" target="_blank" rel="noreferrer" className="underline hover:text-accent">Nikos Spiliotis</a></p>
                <p className="text-xs opacity-80">License: Free To Use YouTube license</p>
              </div>

              <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
                <p className="text-ink font-bold text-lg mb-1">Fragments</p>
                <p className="mb-1">Composer: <a href="https://www.youtube.com/channel/UCoZbM1a4PKQ6haa2Ap4TSdg" target="_blank" rel="noreferrer" className="underline hover:text-accent">AERØHEAD</a></p>
                <p className="text-xs opacity-80">License: Creative Commons (BY-NC 3.0)</p>
              </div>

              <div className="p-4 bg-black/5 dark:bg-white/5 rounded-lg border border-black/5 dark:border-white/5">
                <p className="text-ink font-bold text-lg mb-1">Missing You</p>
                <p className="mb-1">Composer: <a href="https://www.youtube.com/channel/UCKT4pTYebqwd11hd6eTjahw" target="_blank" rel="noreferrer" className="underline hover:text-accent">Neutrin05</a></p>
                <p className="text-xs opacity-80">License: Creative Commons (BY-NC 3.0)</p>
              </div>

              <div className="pt-4 text-center">
                <p className="text-xs font-bold uppercase tracking-widest">
                  Music powered by <a href="https://breakingcopyright.com" target="_blank" rel="noreferrer" className="text-accent hover:underline">BreakingCopyright</a>
                </p>
              </div>

            </div>
          </div>

          <div className="pt-8 text-center">
            <Link href="/" className="btn-primary px-8 py-3">Return Home</Link>
          </div>

        </div>
      </div>
    </div>
  );
}