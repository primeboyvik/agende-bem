import { Lightbulb, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisitType, VISIT_TYPE_INFO } from '@/types/scheduling';

interface VisitTypeCardProps {
  type: VisitType;
  selected?: boolean;
  onClick?: () => void;
}

const icons = {
  Lightbulb,
  Users,
};

export function VisitTypeCard({ type, selected, onClick }: VisitTypeCardProps) {
  const info = VISIT_TYPE_INFO[type];
  const Icon = icons[info.icon];

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all duration-300 w-full h-full',
        'hover:scale-[1.02] hover:shadow-electric',
        selected
          ? type === 'inspiracao'
            ? 'border-secondary bg-secondary/10 shadow-electric'
            : 'border-accent bg-accent/10 shadow-electric'
          : 'border-border bg-card hover:border-primary/50'
      )}
    >
      <div
        className={cn(
          'p-4 rounded-xl transition-all duration-300',
          type === 'inspiracao'
            ? 'bg-gradient-electric'
            : 'bg-gradient-deep',
          'group-hover:animate-pulse-glow'
        )}
      >
        <Icon className="w-10 h-10 text-white" />
      </div>
      <div className="text-center flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-foreground mb-2">{info.label}</h3>
          <p className="text-muted-foreground text-sm mb-4">{info.description}</p>
        </div>
        {/* @ts-ignore - dynamic property check */}
        {info.price && (
          <div className="mt-auto pt-4 border-t border-border/50 w-full">
            <span className="text-2xl font-bold text-primary">{info.price}</span>
            <span className="text-sm text-muted-foreground ml-1">/ pessoa</span>
          </div>
        )}
      </div>
      {selected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}
