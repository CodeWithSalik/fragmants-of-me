import Link from "next/link";

export default function FragmentCard({ entry }) {
  return (
    <Link href={`/entry/${entry.id}`}>
      <div className="p-6 bg-[#fcf8ec] rounded-2xl shadow-xl hover:shadow-amber-200 hover:ring-2 hover:ring-amber-600 transition-all duration-200 cursor-pointer">
        <div className="text-sm text-gray-600 mb-1">
          {entry.timestamp?.toDate?.().toLocaleDateString?.() ||
            new Date(entry.timestamp).toLocaleDateString()}
        </div>
        <div className="text-2xl font-semibold text-[#92400e] mb-2 leading-tight tracking-tight">
          {entry.title}
        </div>
        <div className="text-base text-gray-800 leading-relaxed line-clamp-2">
          {entry.content?.slice(0, 160)}...
        </div>
      </div>
    </Link>
  );
}
