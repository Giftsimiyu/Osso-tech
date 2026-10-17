import Footer from "./footer";

export default function SiteShell({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex min-h-screen flex-col bg-[#FAF9F7] text-[#17151D] ${className}`}>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-9 lg:px-8 lg:py-12">{children}</main>

      <Footer />
    </div>
  );
}
