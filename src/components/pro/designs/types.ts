import type { ReactNode } from 'react';

import type { ForumPost, ForumReply } from '@/src/types';

export type ForumListDesignProps = {
  posts: ForumPost[];
  isAdmin: boolean;
  pinBusyId: string | null;
  /** Post IDs that still need an admin reply (admin list only). */
  needsAdminReplyIds?: ReadonlySet<string>;
  onOpenPost: (postId: string) => void;
  onOpenRank: (
    authorId: string,
    displayName: string,
    authorIsAdmin: boolean,
  ) => void;
  onTogglePin: (post: ForumPost) => void;
};

export type ForumThreadDesignProps = {
  post: ForumPost;
  replies: ForumReply[];
  editing: boolean;
  isAuthor: boolean;
  isAdmin: boolean;
  canDelete: boolean;
  replyBody: string;
  saving: boolean;
  pinBusy: boolean;
  deleteBusy: boolean;
  error: string | null;
  editSlot: ReactNode;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onOpenRank: (
    authorId: string,
    displayName: string,
    authorIsAdmin: boolean,
  ) => void;
  onReplyBodyChange: (value: string) => void;
  onSubmitReply: () => void;
  currentUserId: string | null;
  deletingReplyId: string | null;
  onDeleteReply: (replyId: string) => void;
};
