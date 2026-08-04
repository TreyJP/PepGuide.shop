'use client';

import { ArrowRightLeft, Bookmark, ExternalLink } from 'lucide-react';

import { EvidenceBadge } from '@/src/components/library/evidence-badge';
import { RegulatoryBadge } from '@/src/components/library/regulatory-badge';
import { Button } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { cn } from '@/src/lib/utils';
import type { EvidenceCard } from '@/src/types';

export type ResearchCardProps = {
  card: EvidenceCard;
  saved?: boolean;
  onView?: (peptideId: string) => void;
  onCompare?: (peptideId: string) => void;
  onSave?: (peptideId: string) => void;
  className?: string;
};

export function ResearchCard({
  card,
  saved = false,
  onView,
  onCompare,
  onSave,
  className,
}: ResearchCardProps) {
  return (
    <Card className={cn('flex h-full flex-col', className)}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle>{card.name}</CardTitle>
            {card.aliases.length > 0 ? (
              <CardDescription>{card.aliases.join(' · ')}</CardDescription>
            ) : null}
          </div>
          <span className="shrink-0 rounded-full bg-surface-secondary px-2 py-0.5 text-xs text-foreground-secondary">
            {card.researchCategory}
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
        <p className="text-sm leading-relaxed text-foreground">
          {card.relevanceSummary}
        </p>
        <p className="text-sm text-foreground-secondary">
          <span className="font-medium text-foreground">Mechanism: </span>
          {card.proposedMechanism}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <EvidenceBadge grade={card.humanEvidenceGrade} />
          <EvidenceBadge grade={card.preclinicalEvidenceGrade} />
          <RegulatoryBadge
            status={card.regulatoryStatus}
            detail={card.regulatoryDetail}
          />
        </div>
        {card.knownRisks.length > 0 ? (
          <p className="text-xs text-foreground-secondary">
            <span className="font-medium text-warning">Risks noted: </span>
            {card.knownRisks.slice(0, 2).join('; ')}
            {card.knownRisks.length > 2 ? '…' : ''}
          </p>
        ) : null}
        <p className="text-xs text-foreground-secondary">
          {card.citationCount} citation{card.citationCount === 1 ? '' : 's'}
        </p>
      </CardContent>

      <CardFooter className="flex-wrap gap-2">
        {onView ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onView(card.peptideId)}
          >
            <ExternalLink className="size-3.5" />
            View
          </Button>
        ) : null}
        {onCompare ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCompare(card.peptideId)}
          >
            <ArrowRightLeft className="size-3.5" />
            Compare
          </Button>
        ) : null}
        {onSave ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSave(card.peptideId)}
            className={cn(saved && 'text-accent')}
          >
            <Bookmark className={cn('size-3.5', saved && 'fill-current')} />
            {saved ? 'Saved' : 'Save'}
          </Button>
        ) : null}
      </CardFooter>
    </Card>
  );
}
