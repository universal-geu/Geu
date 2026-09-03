import type { Metadata } from "next";
import AccessGate from "./access-form";

export const metadata: Metadata = {
  title: "GEU | Ya casi estamos listos",
  description: "Estamos preparando algo especial para ti. Muy pronto.",
};

export default function ComingSoonPage() {
  return (
    <div className="fixed inset-0 z-[2147483647] bg-[#0a0f1f]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/geu-coming-soon.png"
        alt="GEU — Ya casi estamos listos. Estamos preparando algo especial para ti."
        className="h-full w-full object-cover"
      />
      <AccessGate />
    </div>
  );
}
