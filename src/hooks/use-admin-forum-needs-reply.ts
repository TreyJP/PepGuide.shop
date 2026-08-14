'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

import { useAdminAccess } from '@/src/hooks/use-admin-access';
import { forumRepository } from '@/src/services/firestore/forum';
import { useForumAdminInboxStore } from '@/src/stores/forum-admin-inbox-store';

/** True when any member thread still lacks an admin reply (admins only). */
export function useAdminForumNeedsReply(): boolean {
  const pathname = usePathname();
  const { isAdmin, loading: adminLoading } = useAdminAccess();
  const needsAdminReply = useForumAdminInboxStore(
    (state) => state.needsAdminReply,
  );
  const setNeedsAdminReply = useForumAdminInboxStore(
    (state) => state.setNeedsAdminReply,
  );

  useEffect(() => {
    if (adminLoading || !isAdmin) {
      setNeedsAdminReply(false);
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const posts = await forumRepository.listPosts({ limit: 80 });
        const candidates = posts.filter((post) => !post.authorIsAdmin);

        const pending = await Promise.all(
          candidates.map(async (post) => {
            try {
              if (post.replyCount === 0) return true;
              const replies = await forumRepository.listReplies(post.id);
              return !replies.some((reply) => reply.authorIsAdmin);
            } catch {
              return false;
            }
          }),
        );

        if (!cancelled) {
          setNeedsAdminReply(pending.some(Boolean));
        }
      } catch {
        if (!cancelled) setNeedsAdminReply(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAdmin, adminLoading, pathname, setNeedsAdminReply]);

  return isAdmin && needsAdminReply;
}
