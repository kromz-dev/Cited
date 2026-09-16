import Link from "next/link";
import { Vortex } from "./Vortex";

export function FinalCTA() {
  return (
    <div className="relative overflow-hidden bg-[var(--color-text,#000)] text-[var(--color-bg,#fff)]">
      <Vortex />
      <div className="relative z-10 max-w-[1080px] mx-auto px-6 py-20 flex flex-wrap gap-8 justify-between items-end">
        <h2 className="text-[clamp(28px,3.6vw,42px)] m-0 max-w-[24ch] leading-[1.06] font-bold">
          Scannez un site de votre portefeuille. Le premier est gratuit.
        </h2>
        <Link href="/#scan-url" className="flex items-center justify-center min-h-[48px] px-8 rounded-md font-medium text-[var(--color-text)] bg-[var(--color-bg)] transition-transform duration-160 hover:-translate-y-0.5">
          Lancer un scan
        </Link>
      </div>
    </div>
  );
}
