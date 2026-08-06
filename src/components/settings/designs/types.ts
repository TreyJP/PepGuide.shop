import type { UserProfile } from '@/src/types';

export type SettingsDesignViewProps = {
  user: UserProfile;
  notice: string;
  deleting: boolean;
  onSignOut: () => void;
  onDeleteAccount: () => void;
};
