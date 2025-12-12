import Link from 'next/link';

import { Container } from '@/components/layout/Container';
import { cn } from '@/lib/cn';

function NavLink({ href, children }: Readonly<{ href: string; children: React.ReactNode }>) {
  return (
    <Link
      href={href}
      className={cn(
        'rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-foreground/5 hover:text-foreground',
      )}
    >
      {children}
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="text-sm font-semibold tracking-wide">
          Wingy Moroccan Kitchen
        </Link>

        <nav className="flex items-center gap-1">
          <NavLink href="/menu">Menu</NavLink>
          <NavLink href="/contact">Contact</NavLink>
        </nav>
      </Container>
    </header>
  );
}
