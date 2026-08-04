import Link from 'next/link';

import { Logo } from '@/src/components/brand/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { BRAND } from '@/src/constants/brand';

export type AuthLayoutProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 py-12">
      <Link
        href="/chat"
        className="mb-8 rounded-[16px] bg-white px-4 py-3 shadow-sm"
      >
        <Logo variant="full" size="lg" priority />
      </Link>


      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">{children}</CardContent>
      </Card>

      {footer ? (
        <div className="mt-6 text-center text-sm text-foreground-secondary">{footer}</div>
      ) : null}

      <p className="mt-8 max-w-md text-center text-xs text-foreground-secondary/80">
        {BRAND.notice}
      </p>
    </div>
  );
}
