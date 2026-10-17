import {
  BadgeCheck,
  CreditCard,
  ShieldCheck,
  Truck,
} from "lucide-react";

const benefits = [
  { label: "Curated tech, chosen well", icon: BadgeCheck },
  { label: "Secure M-Pesa checkout", icon: ShieldCheck },
  { label: "Pay on arrival", icon: CreditCard },
  { label: "Convenient delivery", icon: Truck },
];

function BenefitItems() {
  return (
    <>
      {benefits.map(({ label, icon: Icon }) => (
        <span
          key={label}
          className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-slate-200/80 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm"
        >
          <Icon size={17} className="text-[#6F3DD0]" aria-hidden="true" />
          {label}
        </span>
      ))}
    </>
  );
}

export default function MotionTicker() {
  return (
    <div
      role="region"
      aria-label="Osso Tech shopping benefits"
      className="motion-ticker mt-5 overflow-hidden rounded-2xl border border-[#E7E0F5] bg-gradient-to-r from-[#F8F5FF] via-[#F7F9FF] to-[#F2F7FF] py-2.5"
    >
      <div className="motion-ticker-track flex w-max items-center gap-3 px-3">
        <div className="motion-ticker-group flex shrink-0 items-center gap-3 pr-3">
          <BenefitItems />
        </div>
        <div
          aria-hidden="true"
          className="motion-ticker-group flex shrink-0 items-center gap-3 pr-3"
        >
          <BenefitItems />
        </div>
      </div>
    </div>
  );
}
