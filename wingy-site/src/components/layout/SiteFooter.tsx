import Link from 'next/link';

import { Container } from '@/components/layout/Container';

export function SiteFooter() {
  return (
    <footer className="border-t border-foreground/10 py-10">
      <Container className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground/70">© {new Date().getFullYear()} Wingy Moroccan Kitchen</p>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href="/menu" className="text-foreground/70 hover:text-foreground">
            Menu
          </Link>
          <Link href="/contact" className="text-foreground/70 hover:text-foreground">
            Contact
          </Link>
        </div>
      </Container>
    </footer>
  );
}
