import Link from "next/link";
import dynamic from "next/dynamic";

const MotionDiv = dynamic(
  () => import("framer-motion").then(m => m.motion.div),
  { ssr: false }
);

export default function FragmentCard({ entry, index = 0 }) {
  
  const badgeColors = {
    poem: "bg-emerald-900/10 text-emerald-800 dark:text-emerald-400 dark:bg-emerald-400/10 border-emerald-900/10",
    diary: "bg-amber-900/10 text-amber-900 dark:text-amber-400 dark:bg-amber-400/10 border-amber-900/10",
    monologue: "bg-rose-900/10 text-rose-900 dark:text-rose-400 dark:bg-rose-400/10 border-rose-900/10",
    perspective: "bg-slate-900/10 text-slate-900 dark:text-slate-400 dark:bg-slate-400/10 border-slate-900/10",
  };


  return (
    <MotionDiv

      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="h-full"
    >
      <Link href={`/entry/${entry.id}`} className="block h-full outline-none">
        
        {/* THE AURA WRAPPER: Handles the glow and the scale interaction */}
        <div className="aura-card h-full group cursor-pointer select-none tap-highlight-transparent">
          
          {/* THE CARD CONTENT: Handles the paper texture and text */}
          <div className="aura-card-content p-8 flex flex-col justify-between">
            
            {/* Decor: Subtle shine on top right */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/40 to-transparent opacity-50 rounded-bl-3xl pointer-events-none" />

            <div>
              {/* Header: Date & Badge */}
              <div className="flex justify-between items-start mb-5 opacity-80 group-hover:opacity-100 transition-opacity">
                 <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-muted/80 uppercase">
                  <span>{new Date(entry.timestamp?.toDate?.() || entry.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
                
                <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold border ${badgeColors[entry.type] || "bg-gray-100 text-gray-500"}`}>
                  {entry.type === 'perspective' ? 'Perspectives' : entry.type}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-serif font-bold text-ink leading-tight mb-4 group-hover:text-accent transition-colors duration-300">
                {entry.title}
              </h3>
            </div>

            {/* Excerpt */}
            <div className="flex-grow">
              <p className="text-lg text-ink/70 font-serif leading-relaxed line-clamp-4 group-hover:text-ink/90 transition-colors duration-300">
                {entry.content}
              </p>
            </div>

            {/* Footer: Author & Read More */}
            <div className="mt-8 pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
              <span className="text-xs font-bold text-muted/60 uppercase tracking-widest group-hover:text-accent transition-colors">
                 by {entry.authorName || "Unknown"}
              </span>

              {/* Interactive Arrow that moves on Hover */}
              <span className="text-accent text-xl transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            </div>

          </div>
        </div>
      </Link>
    </MotionDiv>

  );
}