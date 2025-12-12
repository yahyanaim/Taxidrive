import Image from 'next/image';
import Link from 'next/link';

import { Container } from '@/components/layout/Container';
import { SectionHeading } from '@/components/layout/SectionHeading';
import { DishCard } from '@/components/menu/DishCard';
import { getFeaturedDishes } from '@/data/menu';

const highlights = [
  {
    title: 'Warm Ambiance',
    description:
      'A candle-lit dining room with Moroccan tile-inspired details — perfect for date night or family gatherings.',
  },
  {
    title: 'Thoughtful Service',
    description:
      'From tea pours to spice recommendations, our team guides you through the menu with care and ease.',
  },
  {
    title: 'Honest Ingredients',
    description:
      'Seasonal vegetables, slow braises, and small-batch spices create bold flavor without heaviness.',
  },
];

export default function Home() {
  const featured = getFeaturedDishes(6);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-foreground/10">
        <div className="absolute inset-0">
          <Image
            src="/hero-pattern.svg"
            alt=""
            fill
            priority
            className="object-cover opacity-80"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-background/70" />
        </div>

        <Container className="relative py-16 sm:py-20">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div>
              <p className="text-sm font-semibold tracking-wide text-foreground/70">Moroccan comfort • Slow-cooked • Bright spices</p>
              <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
                Wingy Moroccan Kitchen
              </h1>
              <p className="mt-4 max-w-prose text-pretty text-base leading-7 text-foreground/70 sm:text-lg">
                Tagines that simmer for hours, couscous steamed to order, and pastries kissed with orange blossom.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/menu"
                  className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-sm transition hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  View Menu
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-lg border border-foreground/20 bg-background/60 px-5 py-3 text-sm font-semibold text-foreground shadow-sm backdrop-blur transition hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                >
                  Contact Us
                </Link>
              </div>

              <p className="mt-6 text-xs text-foreground/60">Dine in • Takeout • Catering on request</p>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-500/25 via-orange-500/10 to-emerald-500/20 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-background/70 p-6 shadow-sm backdrop-blur">
                <p className="text-sm font-semibold text-foreground">Today’s favorites</p>
                <p className="mt-2 text-sm leading-6 text-foreground/70">
                  New here? Start with preserved-lemon chicken tagine and finish with almond briouats.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {featured.slice(0, 4).map((dish) => (
                    <div key={dish.name} className="rounded-xl bg-foreground/5 p-4">
                      <p className="text-sm font-semibold">{dish.name}</p>
                      <p className="mt-1 text-xs text-foreground/70">{dish.section}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container>
          <SectionHeading
            title="Featured Moroccan dishes"
            subtitle="A small selection of our most-loved plates — slow braised, fragrant, and made for sharing."
          />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((dish) => (
              <DishCard
                key={dish.name}
                name={dish.name}
                description={dish.description}
                price={dish.price}
                badge={dish.section}
              />
            ))}
          </div>

          <div className="mt-10">
            <Link href="/menu" className="text-sm font-semibold text-foreground hover:underline">
              Browse the full menu →
            </Link>
          </div>
        </Container>
      </section>

      <section className="border-t border-foreground/10 bg-foreground/[0.02] py-14 sm:py-16">
        <Container>
          <SectionHeading
            title="A Moroccan table, right in town"
            subtitle="We bring the feeling of a Marrakech evening — music, aromas, and generous hospitality."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-foreground/10 bg-background/70 p-6 shadow-sm backdrop-blur"
              >
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-foreground/70">{item.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-14 sm:py-16">
        <Container className="flex flex-col items-start justify-between gap-6 rounded-3xl border border-foreground/10 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-emerald-500/15 p-8 shadow-sm sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold">Planning a dinner?</p>
            <p className="mt-1 text-sm text-foreground/70">Ask about group platters and catered tagines.</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-3 text-sm font-semibold text-background shadow-sm transition hover:opacity-95"
          >
            Get in touch
          </Link>
        </Container>
      </section>
    </main>
  );
}
