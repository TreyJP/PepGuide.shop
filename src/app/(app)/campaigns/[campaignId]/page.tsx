'use client';

import { use } from 'react';

import { CampaignDetailWorkspace } from '@/src/components/campaigns/campaign-detail-workspace';
import { CampaignsAdminGate } from '@/src/components/campaigns/campaigns-admin-gate';

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = use(params);
  return (
    <div className="h-full overflow-y-auto">
      <CampaignsAdminGate>
        <CampaignDetailWorkspace campaignId={campaignId} />
      </CampaignsAdminGate>
    </div>
  );
}
