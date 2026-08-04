import { ShieldAlert } from 'lucide-react';

import { Button } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { BRAND } from '@/src/constants/brand';
import { cn } from '@/src/lib/utils';

export type SafetyRefusalProps = {
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
};

export function SafetyRefusal({
  title = 'Request not supported',
  message,
  onDismiss,
  className,
}: SafetyRefusalProps) {
  return (
    <Card
      className={cn(
        'border-critical/30 bg-critical-muted/40',
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-critical-muted text-critical">
            <ShieldAlert className="size-5" />
          </div>
          <div>
            <CardTitle className="text-critical">{title}</CardTitle>
            <CardDescription className="mt-1 text-foreground-secondary">
              {BRAND.responsibleUseCopy}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-foreground">{message}</p>
        {onDismiss ? (
          <Button variant="secondary" size="sm" onClick={onDismiss}>
            Understood
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
