import Link from "next/link";
import MotionWrap from "./MotionWrap";

export default function FragmentCard({ entry }) {
  return (
    <MotionWrap>
      <Link href={`/entry/${entry.id}`}>
        <div className="p-6 glass shadow-md hover:shadow-lg hover:shadow-amber-200 hover:ring-2 hover:ring-amber-600 transition-all duration-200 cursor-pointer ">
          
          <div className="text-sm text-gray-600 mb-1">
            {entry.timestamp?.toDate?.().toLocaleDateString?.() ||
              new Date(entry.timestamp).toLocaleDateString()}
          </div>

          <div className="text-2xl md:text-3xl font-semibold tracking-tight text-ink mb-2">

            {entry.title}
          </div>

          <div className="text-base text-gray-800 leading-relaxed line-clamp-2">
            {entry.content?.slice(0, 160)}...
          </div>

        </div>
      </Link>
    </MotionWrap>
  );
}
