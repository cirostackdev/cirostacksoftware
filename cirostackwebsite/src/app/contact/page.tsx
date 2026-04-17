import type { Metadata } from "next";
import Contact from "@/pages-src/Contact";

export const metadata: Metadata = {
  title: "Contact Us | CiroStack",
  description: "Get in touch with CiroStack. We reply within 24 hours.",
};

export default function ContactPage() {
  return <Contact />;
}
