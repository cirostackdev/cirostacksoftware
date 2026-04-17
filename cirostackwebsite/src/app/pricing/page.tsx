import type { Metadata } from "next";
import Pricing from "@/pages-src/Pricing";

export const metadata: Metadata = {
  title: "Pricing | CiroStack",
  description: "Transparent, fixed-price packages for websites, apps, and AI solutions.",
};

export default function PricingPage() {
  return <Pricing />;
}
