import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-parchment text-ink">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        {children}
      </main>
    </div>
  );
}
