import Footer from "./footer";

export default function SiteShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-screen bg-[#FEFEFE] text-[#1E1E1E] ${className}`}>
      <main className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-5 sm:py-10">{children}</main>

      <Footer />
    </div>
  );
}
