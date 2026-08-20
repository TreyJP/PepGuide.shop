'use client';

import Link from 'next/link';

import { Button } from '@/src/components/ui/button';
import { formatCountdown } from '@/src/lib/campaigns/payouts';
import {
  formatCampaignDate,
  formatCampaignMoney,
  payoutSummary,
  type CampaignDirectoryItem,
} from '@/src/components/campaigns/designs/types';

/** Home directory: Arena layout + Vault gold palette. */
export function CampDesignArena({
  campaigns,
}: {
  campaigns: CampaignDirectoryItem[];
}) {
  return (
    <div className="camp-arena">
      <header className="camp-arena__hero">
        <p className="camp-arena__eyebrow">PepGuide Campaigns</p>
        <h1>Create. Share. Climb.</h1>
        <p>
          Join public creator campaigns and compete for cash prize pools with
          verified referrals.
        </p>
      </header>

      <div className="camp-arena__list">
        {campaigns.map((campaign) => {
          const countdown = formatCountdown(campaign.endDate);
          return (
            <article key={campaign.id} className="camp-arena__card">
              <div className="camp-arena__card-top">
                <div className="camp-arena__card-copy">
                  <span className="camp-arena__live">
                    {campaign.status === 'active' ? 'Live now' : campaign.status}
                  </span>
                  <h2>{campaign.name}</h2>
                  <p>{campaign.description}</p>
                </div>
                <div className="camp-arena__prize">
                  <span>Prize pool</span>
                  <strong>{formatCampaignMoney(campaign.prizePoolUsd)}</strong>
                </div>
              </div>

              <div className="camp-arena__stats">
                <div>
                  <span>Ends</span>
                  <strong>
                    {countdown.ended
                      ? 'Closed'
                      : formatCampaignDate(campaign.endDate)}
                  </strong>
                </div>
                <div>
                  <span>Time left</span>
                  <strong>
                    {countdown.ended
                      ? '—'
                      : `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m`}
                  </strong>
                </div>
                <div>
                  <span>Creators</span>
                  <strong>{campaign.participantCount.toLocaleString()}</strong>
                </div>
                <div>
                  <span>Qualified</span>
                  <strong>
                    {campaign.qualifiedReferralCount.toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="camp-arena__foot">
                <span>Payouts · {payoutSummary(campaign.payoutStructure)}</span>
                <Link href={`/campaigns/${campaign.slug}`}>
                  <Button className="camp-arena__join">Join Campaign</Button>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
