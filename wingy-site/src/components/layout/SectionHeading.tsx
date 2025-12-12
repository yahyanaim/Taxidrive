import { cn } from '@/lib/cn';

export function SectionHeading({
  title,
  subtitle,
  className,
}: Readonly<{ title: string; subtitle?: string; className?: string }>) {
  return (
    <div className={cn('max-w-2xl', className)}>
      <h2 className="text-pretty text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm leading-6 text-foreground/70 sm:text-base">{subtitle}</p> : null}
    </div>
  );
}
