import type { Metadata } from "next";
import Services from "@/pages-src/Services";

export const metadata: Metadata = {
  title: "Services | CiroStack",
  description: "Custom software development, mobile apps, and AI automation services for growing businesses.",
};

export default function ServicesPage() {
  return <Services />;
}
