import type { Metadata } from "next";
import Blog from "@/pages-src/Blog";

export const metadata: Metadata = {
  title: "Blog | CiroStack",
  description: "Insights on software development, AI, and building digital products.",
};

export default function BlogPage() {
  return <Blog />;
}
