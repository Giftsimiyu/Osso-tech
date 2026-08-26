import Footer from "./footer";
import Navbar from "./navbar";

export default function SiteShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen bg-[#FEFEFE] text-[#1E1E1E] ${className}`}>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-5 py-4">
          <Navbar />
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-5 py-10">{children}</main>

      <Footer />
    </div>
  );
}
