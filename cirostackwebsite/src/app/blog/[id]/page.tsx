import type { Metadata } from "next";
import BlogPostPage from "@/pages-src/BlogPost";

// All 16 blog post slugs — hardcoded to avoid cross-boundary server import
const POST_SLUGS = [
  "why-fixed-price",
  "ai-automation-guide",
  "react-vs-nextjs",
  "web-design-trends",
  "mvp-launch-checklist",
  "langchain-tutorial",
  "cloud-migration-kubernetes",
  "healthcare-digital-transformation",
  "cicd-devops-best-practices",
  "fintech-security-architecture",
  "design-system-scale",
  "headless-ecommerce-architecture",
  "ml-models-production",
  "outsourcing-vs-inhouse",
  "real-time-data-pipelines",
  "scaling-saas-post-funding",
];

type Props = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return POST_SLUGS.map((id) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Blog Post | CiroStack`,
    description: `Read our blog post on ${id.replace(/-/g, " ")} at CiroStack.`,
  };
}

export default async function BlogPostRoute({ params }: Props) {
  void params;
  return <BlogPostPage />;
}
