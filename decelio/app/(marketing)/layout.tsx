import { ReactNode } from "react";
import { Beacon } from "./beacon";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Beacon />
      {children}
    </>
  );
}
