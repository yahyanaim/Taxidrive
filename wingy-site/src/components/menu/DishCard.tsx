import { cn } from '@/lib/cn';

export type DishCardProps = {
  name: string;
  description: string;
  price: string;
  badge?: string;
  className?: string;
};

export function DishCard({ name, description, price, badge, className }: DishCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-foreground/10 bg-background/60 p-5 shadow-sm backdrop-blur',
        'transition hover:border-foreground/20 hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold leading-6">{name}</h3>
          {badge ? (
            <p className="mt-1 inline-flex rounded-full bg-foreground/5 px-2 py-0.5 text-xs font-medium text-foreground/70">
              {badge}
            </p>
          ) : null}
        </div>
        <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{price}</p>
      </div>
      <p className="mt-3 text-sm leading-6 text-foreground/70">{description}</p>
    </div>
  );
}
