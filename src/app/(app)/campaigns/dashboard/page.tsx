'use client';

import { CampaignsAdminGate } from '@/src/components/campaigns/campaigns-admin-gate';
import { CampaignsDashboard } from '@/src/components/campaigns/campaigns-dashboard';

export default function CampaignsDashboardPage() {
  return (
    <div className="h-full overflow-y-auto">
      <CampaignsAdminGate>
        <CampaignsDashboard />
      </CampaignsAdminGate>
    </div>
  );
}
