// components/Layout.js
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-parchment text-ink flex flex-col">
      <Header />
      <main className="flex-grow max-w-3xl mx-auto pt-10 pb-20 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
      <footer className="text-center text-xs text-gray-500 py-4 border-t border-amber-light">
        © {new Date().getFullYear()} Fragments of Me — Crafted by <span className="font-semibold text-amber-dark">Salik Pirzada</span> @ <span className="text-amber-dark">CodeWithSalik</span>
      </footer>
    </div>
  );
}
