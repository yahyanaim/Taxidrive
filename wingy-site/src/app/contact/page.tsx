import Link from 'next/link';

import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/layout/SectionHeading';

export default function ContactPage() {
  return (
    <main>
      <section className="border-b border-foreground/10">
        <Container className="py-14 sm:py-16">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">Contact</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-foreground/70 sm:text-lg">
            Questions about catering, reservations, or allergens? We’re happy to help.
          </p>
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container>
          <SectionHeading title="Reach us" subtitle="Use the details below, or stop by for mint tea." />

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-foreground/10 bg-background/70 p-6 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold">Phone</p>
              <p className="mt-2 text-sm text-foreground/70">(555) 012-3456</p>
            </div>
            <div className="rounded-2xl border border-foreground/10 bg-background/70 p-6 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold">Email</p>
              <p className="mt-2 text-sm text-foreground/70">hello@wingykitchen.example</p>
            </div>
            <div className="rounded-2xl border border-foreground/10 bg-background/70 p-6 shadow-sm backdrop-blur">
              <p className="text-sm font-semibold">Hours</p>
              <p className="mt-2 text-sm text-foreground/70">Mon–Sun: 11am – 10pm</p>
            </div>
          </div>

          <div className="mt-10">
            <Link href="/menu" className="text-sm font-semibold text-foreground hover:underline">
              View the menu →
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
