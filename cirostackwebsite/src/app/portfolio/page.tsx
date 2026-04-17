import type { Metadata } from "next";
import { Suspense } from "react";
import Portfolio from "@/pages-src/Portfolio";

export const metadata: Metadata = {
  title: "Portfolio | CiroStack",
  description: "Browse our case studies — real projects, real results, across every industry.",
};

export default function PortfolioPage() {
  return (
    <Suspense fallback={null}>
      <Portfolio />
    </Suspense>
  );
}
