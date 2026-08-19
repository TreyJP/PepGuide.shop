'use client';

import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { PRO_PROTOCOLS } from '@/src/data/pro/protocols';
import { protocolShopLinksRepository } from '@/src/services/firestore/protocol-shop-links';
import type { ProtocolShopLink } from '@/src/types/protocol-shop-links';

type DraftLink = {
  id: string;
  href: string;
  label: string;
};

function blankLink(): DraftLink {
  return { id: '', href: '', label: 'Shop this stack' };
}

export function AdminProtocolShopLinksPanel() {
  const [selectedId, setSelectedId] = useState(PRO_PROTOCOLS[0]?.id ?? '');
  const [links, setLinks] = useState<DraftLink[]>([blankLink()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selected =
    PRO_PROTOCOLS.find((protocol) => protocol.id === selectedId) ??
    PRO_PROTOCOLS[0] ??
    null;

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    setLoading(true);
    setMessage(null);
    void (async () => {
      try {
        const doc = await protocolShopLinksRepository.getByProtocolId(
          selectedId,
        );
        if (cancelled) return;
        const next = doc?.links.length
          ? doc.links.map((link) => ({
              id: link.id,
              href: link.href,
              label: link.label,
            }))
          : [blankLink()];
        setLinks(next);
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error instanceof Error
              ? error.message
              : 'Unable to load protocol shop links.',
          );
          setLinks([blankLink()]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    setMessage(null);
    try {
      const saved = await protocolShopLinksRepository.save(selectedId, links);
      setLinks(
        saved.links.length
          ? saved.links.map((link) => ({
              id: link.id,
              href: link.href,
              label: link.label,
            }))
          : [blankLink()],
      );
      setMessage(
        saved.links.length
          ? `Saved ${saved.links.length} shop link${saved.links.length === 1 ? '' : 's'}.`
          : 'Cleared shop links for this protocol.',
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Unable to save shop links.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Protocol shop links</CardTitle>
          <CardDescription>
            Paste vendor one-click stack URLs (e.g. Refined Biolabs{' '}
            <span className="font-mono">/stack/…</span>). They appear as shop
            buttons on that protocol — no code change needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex w-full flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">
              Protocol
            </span>
            <select
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
              className="h-10 w-full rounded-[12px] border border-border bg-surface px-3 text-sm text-foreground"
            >
              {PRO_PROTOCOLS.map((protocol) => (
                <option key={protocol.id} value={protocol.id}>
                  {protocol.name}
                </option>
              ))}
            </select>
          </label>

          {selected ? (
            <p className="text-xs text-foreground-secondary">
              {selected.goal} · {selected.peptides.map((item) => item.name).join(', ')}
            </p>
          ) : null}

          {loading ? (
            <p className="flex items-center gap-2 text-sm text-foreground-secondary">
              <Loader2 className="size-4 animate-spin" />
              Loading links…
            </p>
          ) : (
            <div className="space-y-3">
              {links.map((link, index) => (
                <div
                  key={link.id || `new-${index}`}
                  className="space-y-2 rounded-[14px] border border-border p-3"
                >
                  <Input
                    label="Button label"
                    value={link.label}
                    onChange={(event) =>
                      setLinks((current) =>
                        current.map((item, i) =>
                          i === index
                            ? { ...item, label: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="Shop Refined stack"
                  />
                  <Input
                    label="One-click stack URL"
                    value={link.href}
                    onChange={(event) =>
                      setLinks((current) =>
                        current.map((item, i) =>
                          i === index
                            ? { ...item, href: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder="https://refinedbiolabs.com/stack/…?utm_source=affiliate_marketing&code=PEPGUIDE"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-[10px] px-2 py-1 text-xs text-foreground-secondary hover:bg-critical/10 hover:text-critical"
                      onClick={() =>
                        setLinks((current) =>
                          current.length <= 1
                            ? [blankLink()]
                            : current.filter((_, i) => i !== index),
                        )
                      }
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => setLinks((current) => [...current, blankLink()])}
              >
                <Plus className="size-3.5" />
                Add another vendor link
              </Button>
            </div>
          )}

          {message ? (
            <p className="text-sm text-foreground-secondary">{message}</p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => void handleSave()}
              disabled={saving || loading || !selectedId}
            >
              {saving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : null}
              Save links
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export type { ProtocolShopLink };
