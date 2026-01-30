import Link from "next/link";
import { FiGithub, FiTwitter, FiInstagram } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="w-full border-t border-black/5 dark:border-white/5 py-12 mt-20 bg-white/40 dark:bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-6 max-w-7xl flex flex-col md:flex-row justify-between items-center gap-8">
        
        {/* Brand */}
        <div className="text-center md:text-left">
          <h3 className="text-lg font-serif font-bold text-ink mb-1">Fragments of Me</h3>
          <p className="text-xs text-muted uppercase tracking-widest">CodeWithSalik © {new Date().getFullYear()}</p>
        </div>

        {/* Links */}
        <div className="flex gap-8 text-sm font-bold text-muted/80">
          <Link href="/credits" className="hover:text-accent transition-colors">Credits</Link>
          <Link href="/apply-author" className="hover:text-accent transition-colors">Join Us</Link>
        </div>

        {/* Socials */}
        <div className="flex gap-6 text-ink/70">
          <a href="https://x.com/codewithsalik" target="_blank" className="hover:text-accent transition-colors"><FiTwitter size={18} /></a>
          <a href="https://www.instagram.com/codewithsalik" target="_blank" className="hover:text-accent transition-colors"><FiInstagram size={18} /></a>
          <a href="https://github.com/CodeWithSalik" target="_blank" className="hover:text-accent transition-colors"><FiGithub size={18} /></a>
        </div>

      </div>
    </footer>
  );
}