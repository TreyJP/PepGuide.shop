'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  ChevronDown,
  MessageSquare,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

import { Logo } from '@/src/components/brand/logo';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { BRAND } from '@/src/constants/brand';



const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Ask a research question',
    description:
      'Describe your topic in plain language. PepGuide AI organizes educational context without personal treatment advice.',
  },
  {
    step: '02',
    title: 'Review evidence cards',
    description:
      'Each response separates human, animal, and preclinical evidence with regulatory framing and known uncertainties.',
  },
  {
    step: '03',
    title: 'Compare compounds',
    description:
      'Build neutral side-by-side views of mechanisms, evidence grades, risks, and research categories.',
  },
  {
    step: '04',
    title: 'Save and organize',
    description:
      'Bookmark AI summaries, peptide profiles, and comparisons into folders for ongoing research review.',
  },
] as const;

const FAQ_ITEMS = [
  {
    question: 'Does PepGuide sell or prescribe peptides?',
    answer:
      'No. PepGuide is an educational research platform. It does not sell peptides, provide prescriptions, or offer sourcing information.',
  },
  {
    question: 'Can PepGuide create dosing or injection plans?',
    answer:
      'No. Personalized dosing, injection instructions, reconstitution guidance, and vendor recommendations are refused by design.',
  },
  {
    question: 'Is PepGuide free?',
    answer:
      'Yes. PepGuide is completely free. AI research chat, library access, comparison, and saved research are available without a paid plan.',
  },
  {
    question: 'How should I use AI-generated summaries?',
    answer:
      'Treat all outputs as educational starting points. Independently verify claims against primary literature and qualified professionals where appropriate.',
  },
] as const;

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border py-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="text-sm font-medium text-foreground">{question}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-foreground-secondary transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open ? (
        <p className="mt-3 text-sm leading-relaxed text-foreground-secondary">{answer}</p>
      ) : null}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-svh">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container-page flex h-14 items-center justify-between gap-2 sm:h-16">
          <Link
            href="/chat"
            className="min-w-0 shrink rounded-[12px] bg-white px-2 py-1.5 sm:px-3 sm:py-2"
          >
            <Logo variant="full" size="sm" priority className="sm:hidden" />
            <Logo
              variant="full"
              size="md"
              priority
              className="hidden sm:block"
            />
          </Link>

          <nav className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm" className="sm:h-10 sm:px-4">
                Sign in
              </Button>
            </Link>
            <Link href="/chat">
              <Button size="sm" className="sm:h-10 sm:px-4">
                <span className="sm:hidden">Start</span>
                <span className="hidden sm:inline">Start researching</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <section className="container-page py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="accent" className="mb-6">
            Research intelligence platform
          </Badge>
          <div className="mb-6 flex justify-center">
            <div className="rounded-[18px] bg-white px-5 py-4 shadow-sm">
              <Logo variant="full" size="lg" priority />
            </div>
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            {BRAND.headline}
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-foreground-secondary md:text-xl">
            {BRAND.description}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/chat">
              <Button size="lg">
                Start researching
                <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="secondary">
                Explore library
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-sm text-foreground-secondary/90">{BRAND.notice}</p>
        </div>
      </section>

      <section className="border-y border-border bg-surface/40 py-20">
        <div className="container-page grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Badge variant="accent" className="mb-4">
              AI chat preview
            </Badge>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
              Structured answers, not noise
            </h2>
            <p className="mt-4 text-foreground-secondary">
              PepGuide AI synthesizes research-oriented responses with evidence cards, citations,
              suggested follow-ups, and safety classification — all within educational boundaries.
            </p>
          </div>
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border bg-surface-secondary/50 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-accent" />
                <CardTitle className="text-sm">{BRAND.assistantName}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              <div className="rounded-[14px] bg-accent px-4 py-3 text-sm text-white">
                Which peptides are studied for metabolic research?
              </div>
              <div className="rounded-[14px] border border-border bg-surface-elevated p-4 text-sm leading-relaxed text-foreground-secondary">
                Based on your research question, compounds frequently discussed include semaglutide
                and retatrutide. Human evidence grades and regulatory status are shown on each card
                below — not as personal recommendations.
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-[12px] border border-border p-3">
                  <p className="text-sm font-medium">Semaglutide</p>
                  <Badge variant="success" className="mt-2">
                    Strong human evidence
                  </Badge>
                </div>
                <div className="rounded-[12px] border border-border p-3">
                  <p className="text-sm font-medium">Retatrutide</p>
                  <Badge variant="warning" className="mt-2">
                    Early-stage research
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="mb-12 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
            How it works
          </h2>
          <p className="mt-3 text-foreground-secondary">
            A research workflow designed for clarity, safety, and evidence transparency.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS.map((item) => (
            <Card key={item.step} className="relative overflow-hidden">
              <CardHeader>
                <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                  Step {item.step}
                </span>
                <CardTitle className="mt-2">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface/40 py-20">
        <div className="container-page">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <Badge variant="accent" className="mb-4">
                Research library
              </Badge>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
                Curated peptide profiles
              </h2>
            </div>
            <Link href="/sign-in">
              <Button variant="secondary">
                Browse library
                <BookOpen className="size-4" />
              </Button>
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { name: 'Semaglutide', category: 'Metabolic research', grade: 'Strong human' },
              { name: 'BPC-157', category: 'Recovery research', grade: 'Limited human' },
              { name: 'Retatrutide', category: 'Metabolic research', grade: 'Early-stage' },
            ].map((peptide) => (
              <Card key={peptide.name}>
                <CardHeader>
                  <CardTitle>{peptide.name}</CardTitle>
                  <CardDescription>{peptide.category}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="accent">{peptide.grade}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <Badge variant="accent" className="mb-4">
              Evidence ratings
            </Badge>
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
              Transparent evidence grading
            </h2>
            <p className="mt-4 text-foreground-secondary">
              Every profile and AI card labels human and preclinical evidence strength, regulatory
              status, and known uncertainties so you can separate hype from published research.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge variant="success">Strong human</Badge>
              <Badge variant="accent">Moderate human</Badge>
              <Badge variant="warning">Limited / early-stage</Badge>
              <Badge variant="critical">Preclinical only</Badge>
            </div>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Comparison preview</CardTitle>
              <CardDescription>
                Neutral side-by-side research differences across compounds.
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-foreground-secondary">
                    <th className="pb-3 pr-4 font-medium">Attribute</th>
                    <th className="pb-3 pr-4 font-medium">Semaglutide</th>
                    <th className="pb-3 font-medium">Retatrutide</th>
                  </tr>
                </thead>
                <tbody className="text-foreground-secondary">
                  <tr className="border-b border-border/60">
                    <td className="py-3 pr-4 text-foreground">Human evidence</td>
                    <td className="py-3 pr-4">Strong</td>
                    <td className="py-3">Early-stage</td>
                  </tr>
                  <tr className="border-b border-border/60">
                    <td className="py-3 pr-4 text-foreground">Regulatory</td>
                    <td className="py-3 pr-4">FDA approved (specific)</td>
                    <td className="py-3">Investigational</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-foreground">Mechanism</td>
                    <td className="py-3 pr-4">GLP-1 agonist</td>
                    <td className="py-3">Triple agonist</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y border-border bg-surface/40 py-20">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-[12px] bg-accent-muted text-accent">
                <Shield className="size-5" />
              </div>
              <CardTitle>Safety by design</CardTitle>
              <CardDescription>{BRAND.responsibleUseCopy}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-[12px] bg-accent-secondary-muted text-accent-secondary">
                <Bookmark className="size-5" />
              </div>
              <CardTitle>Saved research</CardTitle>
              <CardDescription>
                Organize AI responses, peptide profiles, comparisons, and notes into folders for
                ongoing literature review.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="container-page py-20">
        <div className="mx-auto max-w-2xl rounded-[18px] border border-border bg-surface px-8 py-10 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
            Completely free
          </h2>
          <p className="mt-3 text-foreground-secondary">
            PepGuide includes AI research chat, library access, compound comparison, and saved
            research at no cost. No subscriptions, no upgrades, no paywalls.
          </p>
          <div className="mt-6">
            <Link href="/chat">
              <Button size="lg">
                Start researching
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface/40 py-20">
        <div className="container-page mx-auto max-w-2xl">
          <h2 className="mb-8 text-center font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
            Frequently asked questions
          </h2>
          {FAQ_ITEMS.map((item) => (
            <FaqItem key={item.question} {...item} />
          ))}
        </div>
      </section>

      <section className="container-page py-20">
        <Card className="overflow-hidden border-accent/20 bg-gradient-to-br from-accent-muted/30 to-accent-secondary-muted/20">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <MessageSquare className="mb-4 size-8 text-accent" />
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold text-foreground">
              Ready to research with clarity?
            </h2>
            <p className="mt-3 max-w-lg text-foreground-secondary">
              Create a free account and explore peptide literature with structured evidence, safety
              guardrails, and organized saved research.
            </p>
            <Link href="/chat">
              <Button size="lg" className="mt-8">
                Start researching
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <footer className="border-t border-border py-12">
        <div className="container-page flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/chat" className="rounded-[12px] bg-white px-3 py-2">
            <Logo variant="full" size="sm" />
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-foreground-secondary">
            <Link href="/sign-in" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href="/sign-up" className="hover:text-foreground">
              Sign up
            </Link>

            <span>{BRAND.notice}</span>
          </div>
          <p className="text-xs text-foreground-secondary">
            © {new Date().getFullYear()} {BRAND.name}
          </p>
        </div>
      </footer>
    </div>
  );
}
