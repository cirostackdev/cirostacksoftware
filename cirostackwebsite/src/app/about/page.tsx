import type { Metadata } from "next";
import About from "@/pages-src/About";

export const metadata: Metadata = {
  title: "About | CiroStack",
  description: "Learn about CiroStack — our story, values, and the team behind every project.",
};

export default function AboutPage() {
  return <About />;
}
