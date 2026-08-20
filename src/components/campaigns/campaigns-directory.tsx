'use client';

import { useEffect, useState } from 'react';

import '@/src/components/campaigns/campaigns.css';
import { CampDesignArena } from '@/src/components/campaigns/designs/directory-designs';
import type { CampaignDirectoryItem } from '@/src/components/campaigns/designs/types';

export function CampaignsDirectory() {
  const [campaigns, setCampaigns] = useState<CampaignDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/campaigns');
        const data = (await response.json()) as {
          campaigns?: CampaignDirectoryItem[];
          error?: string;
        };
        if (!response.ok) throw new Error(data.error || 'Unable to load.');
        setCampaigns(data.campaigns ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="campaigns-root campaigns-root--vault mx-auto max-w-5xl p-4 sm:p-6">
        <p className="py-20 text-center text-sm text-foreground-secondary">
          Loading campaigns…
        </p>
      </div>
    );
  }

  if (error) {
    return <p className="py-16 text-center text-sm text-critical">{error}</p>;
  }

  return (
    <div
      className="campaigns-root campaigns-root--vault mx-auto max-w-5xl space-y-6 p-4 sm:p-6"
      data-design="arena"
    >
      {campaigns.length === 0 ? (
        <div className="camp-vault__empty">
          <p className="camp-vault__eyebrow">PepGuide Campaigns</p>
          <h2>No live campaigns yet</h2>
          <p>
            The next creator prize pool will appear here when PepGuide opens it.
          </p>
        </div>
      ) : (
        <CampDesignArena campaigns={campaigns} />
      )}
    </div>
  );
}
