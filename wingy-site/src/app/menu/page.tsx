import Link from 'next/link';

import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/layout/SectionHeading';
import { DishCard } from '@/components/menu/DishCard';
import { menu, menuSections } from '@/data/menu';

export default function MenuPage() {
  return (
    <main id="top">
      <section className="border-b border-foreground/10">
        <Container className="py-14 sm:py-16">
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">Menu</h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-7 text-foreground/70 sm:text-lg">
            Moroccan classics, cooked low and slow. Use the quick links to jump between sections.
          </p>

          <nav className="mt-8 flex flex-wrap gap-2">
            {menuSections.map((section) => (
              <Link
                key={section.key}
                href={`#${section.key}`}
                className="rounded-full border border-foreground/15 bg-background/70 px-4 py-2 text-sm font-semibold text-foreground/80 shadow-sm backdrop-blur transition hover:bg-background hover:text-foreground"
              >
                {section.label}
              </Link>
            ))}
          </nav>
        </Container>
      </section>

      {menuSections.map((section) => (
        <section key={section.key} id={section.key} className="scroll-mt-24 py-14 sm:py-16">
          <Container>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading title={section.label} subtitle={section.description} />
              <Link href="#top" className="text-sm font-semibold text-foreground/70 hover:text-foreground hover:underline">
                Back to top
              </Link>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {menu[section.key].map((dish) => (
                <DishCard key={dish.name} name={dish.name} description={dish.description} price={dish.price} />
              ))}
            </div>
          </Container>
        </section>
      ))}

      <section className="border-t border-foreground/10 bg-foreground/[0.02] py-14 sm:py-16">
        <Container>
          <SectionHeading
            title="Allergens & custom spice"
            subtitle="Many dishes can be made gluten-free or extra mild. Let us know about allergies and your preferred spice level."
          />
          <div className="mt-8">
            <Link href="/contact" className="text-sm font-semibold text-foreground hover:underline">
              Contact us for dietary questions →
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
