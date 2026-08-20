'use client';

import { CampaignsAdminGate } from '@/src/components/campaigns/campaigns-admin-gate';
import { CampaignsDirectory } from '@/src/components/campaigns/campaigns-directory';

export default function CampaignsPage() {
  return (
    <div className="h-full overflow-y-auto">
      <CampaignsAdminGate>
        <CampaignsDirectory />
      </CampaignsAdminGate>
    </div>
  );
}
