'use client';

import { Check, ChevronDown, Copy } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { AFFILIATE_FAQ } from '@/src/components/affiliates/designs/content';
import type { AffiliateDesignViewProps } from '@/src/components/affiliates/designs/types';

export function AffFaqList({ className = '' }: { className?: string }) {
  return (
    <div className={className}>
      {AFFILIATE_FAQ.map((item) => (
        <AffFaqItem key={item.question} {...item} />
      ))}
    </div>
  );
}

function AffFaqItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="aff-faq__item">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="aff-faq__q"
      >
        <span>{question}</span>
        <ChevronDown className={open ? 'rotate-180' : undefined} />
      </button>
      {open ? <p className="aff-faq__a">{answer}</p> : null}
    </div>
  );
}

export function AffCopyButton({
  label,
  copiedLabel,
  kind,
  value,
  copied,
  onCopy,
  size = 'md',
  variant = 'primary',
}: {
  label: string;
  copiedLabel?: string;
  kind: 'link' | 'code';
  value: string;
  copied: AffiliateDesignViewProps['copied'];
  onCopy: AffiliateDesignViewProps['onCopy'];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
}) {
  const isCopied = copied === kind;
  return (
    <Button
      size={size}
      variant={variant}
      onClick={() => void onCopy(value, kind)}
      disabled={!value}
    >
      {isCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {isCopied ? (copiedLabel ?? 'Copied') : label}
    </Button>
  );
}
