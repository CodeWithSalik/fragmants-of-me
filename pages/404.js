/* eslint-disable react/no-unescaped-entities */
import Link from "next/link";
import dynamic from "next/dynamic";
const motion = dynamic(() =>
  import("framer-motion").then(m => m.motion),
  { ssr: false }
);
import Head from "next/head";

export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Head><title>Lost | Fragmants of Me</title></Head>
      
      <div className="aura-card reading-mode w-full max-w-lg">
        <div className="aura-card-content p-12 text-center">
          
          <h1 className="text-8xl font-black text-accent/20 mb-6">404</h1>
          
          <h2 className="text-2xl font-serif font-bold text-ink mb-4">
            This Page Does Not Exist
          </h2>
          
          <p className="text-muted italic mb-8 leading-relaxed">
            "The fragment you seek has drifted away, or perhaps it was never written at all."
          </p>

          <Link href="/">
            <button className="btn-primary px-8 py-3">
              Return Home
            </button>
          </Link>

        </div>
      </div>
    </div>
  );
}