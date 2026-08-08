import type { UserProfile } from '@/src/types';

export type SettingsDesignViewProps = {
  user: UserProfile;
  notice: string;
  deleting: boolean;
  billingBusy: boolean;
  billingError: string | null;
  onSignOut: () => void;
  onDeleteAccount: () => void;
  onSubscribePro: () => void;
  onManageBilling: () => void;
};
