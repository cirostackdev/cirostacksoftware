import type { Metadata } from "next";
import { industriesData } from "@/data/industries-generated";
import Industry from "@/pages-src/Industry";

const slug = "blockchain-crypto";
const industry = industriesData[slug];

export const metadata: Metadata = {
  title: industry ? `${industry.title} | CiroStack` : "Industry | CiroStack",
  description: industry?.tagline ?? "",
};

export default function BlockchainCryptoPage() {
  return <Industry />;
}
