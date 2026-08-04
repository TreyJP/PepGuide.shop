import { AlertTriangle, Phone } from 'lucide-react';

import { Button } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { cn } from '@/src/lib/utils';

export type UrgentWarningProps = {
  title?: string;
  message: string;
  emergencyNumber?: string;
  onAcknowledge?: () => void;
  className?: string;
};

export function UrgentWarning({
  title = 'Seek immediate medical attention',
  message,
  emergencyNumber = '911',
  onAcknowledge,
  className,
}: UrgentWarningProps) {
  return (
    <Card
      className={cn(
        'border-warning/40 bg-warning-muted/50',
        className,
      )}
      role="alert"
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-warning-muted text-warning">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <CardTitle className="text-warning">{title}</CardTitle>
            <CardDescription className="mt-1">
              PepGuide cannot provide emergency medical guidance.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-foreground">{message}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="destructive" size="sm" className="gap-2">
            <Phone className="size-3.5" />
            Call {emergencyNumber}
          </Button>
          {onAcknowledge ? (
            <Button variant="secondary" size="sm" onClick={onAcknowledge}>
              I understand
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
