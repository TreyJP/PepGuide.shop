import { ArrowRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

import { EvidenceBadge } from '@/src/components/library/evidence-badge';
import { RegulatoryBadge } from '@/src/components/library/regulatory-badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { cn } from '@/src/lib/utils';
import type { Peptide } from '@/src/types';

export type PeptideCardProps = {
  peptide: Peptide;
  href?: string;
  onSelect?: (peptideId: string) => void;
  className?: string;
};

export function PeptideCard({
  peptide,
  href,
  onSelect,
  className,
}: PeptideCardProps) {
  const content = (
    <Card
      className={cn(
        'group h-full transition-all hover:border-accent/30 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)]',
        (href || onSelect) && 'cursor-pointer',
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="line-clamp-1">{peptide.name}</CardTitle>
            {peptide.aliases.length > 0 ? (
              <CardDescription className="line-clamp-1">
                {peptide.aliases.join(' · ')}
              </CardDescription>
            ) : null}
          </div>
          <div className="flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-accent-muted text-accent">
            <BookOpen className="size-4" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        <p className="line-clamp-2 text-sm leading-relaxed text-foreground-secondary">
          {peptide.shortDescription}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {peptide.researchCategories.slice(0, 3).map((category) => (
            <span
              key={category}
              className="rounded-full bg-surface-secondary px-2 py-0.5 text-xs text-foreground-secondary"
            >
              {category}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          <EvidenceBadge grade={peptide.humanEvidenceGrade} />
          <RegulatoryBadge
            status={peptide.regulatoryStatus}
            detail={peptide.regulatoryDetail}
          />
        </div>
      </CardContent>

      <CardFooter className="text-sm font-medium text-accent">
        View profile
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </CardFooter>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  if (onSelect) {
    return (
      <button type="button" onClick={() => onSelect(peptide.id)} className="w-full text-left">
        {content}
      </button>
    );
  }

  return content;
}
