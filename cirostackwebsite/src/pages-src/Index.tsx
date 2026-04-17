"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Globe, Smartphone, Bot, Search, Palette, Code, Rocket, HeadphonesIcon, ArrowRight, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { SEO } from "@/components/SEO";
import SectionHeading from "@/components/SectionHeading";
import HeroSlider from "@/components/HeroSlider";
import imgHealthflow from "@/assets/portfolio-healthflow.jpg";
import imgShoplocal from "@/assets/portfolio-shoplocal.jpg";
import imgAutotask from "@/assets/portfolio-autotask.jpg";
import { TestimonialsMarquee } from "@/components/TestimonialsMarquee";
import { allTestimonials } from "@/data/testimonials";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

const services = [
  {
    icon: Globe,
    title: "Websites",
    description: "Stunning, responsive websites that convert visitors into customers. Built for speed and SEO.",
    link: "/services/websites",
  },
  {
    icon: Smartphone,
    title: "Web & Mobile Apps",
    description: "Custom applications that scale with your business. From MVPs to enterprise solutions.",
    link: "/services/apps",
  },
  {
    icon: Bot,
    title: "AI Automation",
    description: "Intelligent automation tools that save time, reduce costs, and unlock new capabilities.",
    link: "/services/ai",
  },
];

const steps = [
  { icon: Search, title: "Discovery & Quote", description: "We learn about your goals and provide a fixed-price quote." },
  { icon: Palette, title: "Design & Approval", description: "We create mockups for your review and iterate until perfect." },
  { icon: Code, title: "Development", description: "Our team builds your project with clean, scalable code." },
  { icon: Rocket, title: "Testing & Launch", description: "Rigorous QA testing before a smooth, confident launch." },
  { icon: HeadphonesIcon, title: "Ongoing Support", description: "Post-launch support to keep everything running smoothly." },
];

const projects = [
  {
    title: "HealthFlow Dashboard",
    client: "MedTech Startup",
    description: "A patient management dashboard with real-time analytics and AI-powered insights.",
    tags: ["Web App", "AI"],
    image: imgHealthflow,
  },
  {
    title: "ShopLocal Marketplace",
    client: "Retail Collective",
    description: "Multi-vendor e-commerce platform connecting local businesses with their community.",
    tags: ["Website", "E-commerce"],
    image: imgShoplocal,
  },
  {
    title: "AutoTask AI",
    client: "Operations Corp",
    description: "AI-driven workflow automation reducing manual processes by 75%.",
    tags: ["AI", "Automation"],
    image: imgAutotask,
  },
];

const Index = () => {
  return (
    <Layout>
      <SEO />
      <HeroSlider />

      {/* Trust Logos */}
      <section className="py-12 border-y border-border section-alt">
        <div className="container mx-auto px-4 md:px-6">
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6">Trusted by innovative teams</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {["TechNova", "GrowthLab", "PixelCraft", "DataVerse", "CloudPeak"].map((name) => (
              <span key={name} className="text-lg font-display font-semibold text-muted-foreground/40">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-padding">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading
            badge="What We Do"
            title="Services built for growth"
            description="From landing pages to enterprise AI solutions, we deliver the tools your business needs to thrive."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Link href={service.link} className="block h-full">
                  <div className="h-full p-8 rounded-2xl surface-glass hover-lift group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                      <service.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-display font-semibold text-foreground mb-3">{service.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{service.description}</p>
                    <span className="text-primary text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      Learn More <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Work */}
      <section className="section-padding section-alt">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading
            badge="Our Process"
            title="How we bring ideas to life"
            description="A proven, transparent process designed for speed and quality."
          />
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="text-center relative"
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary mb-1 block">Step {i + 1}</span>
                <h4 className="font-display font-semibold text-foreground text-sm mb-2">{step.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Work */}
      <section className="section-padding">
        <div className="container mx-auto px-4 md:px-6">
          <SectionHeading
            badge="Our Work"
            title="Featured projects"
            description="A selection of work we're proud of."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projects.map((project, i) => (
              <motion.div
                key={project.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
              >
                <Link href="/portfolio" className="block group">
                  <div className="rounded-2xl overflow-hidden surface-glass hover-lift">
                    <div className="h-48 overflow-hidden">
                      <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                    <div className="p-6">
                      <p className="text-xs text-primary font-medium mb-1">{project.client}</p>
                      <h3 className="font-display font-semibold text-foreground text-lg mb-2">{project.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{project.description}</p>
                      <div className="flex gap-2">
                        {project.tags.map((tag) => (
                          <span key={tag} className="text-xs px-2 py-1 rounded-md bg-secondary text-muted-foreground">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsMarquee
        items={allTestimonials}
        heading="What our partners say"
        subheading="Trusted by founders, CTOs and engineering teams worldwide."
        sectionBg="bg-card"
      />

      {/* CTA */}
      <section className="section-padding">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
              Ready to build something <span className="text-gradient">great</span>?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Let's talk about your project. We'll reply within 24 hours.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" className="text-base px-8">
                  Get in Touch
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Or email us at{" "}
              <a href="mailto:hello@cirostack.com" className="text-primary hover:underline">
                hello@cirostack.com
              </a>
            </p>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
