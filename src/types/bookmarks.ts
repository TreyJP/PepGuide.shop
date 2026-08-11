/** PepGuide Pro bookmarks — saved peptides, education videos, and protocols. */
export type ProBookmarkKind = 'peptide' | 'video' | 'protocol';

export type ProBookmark = {
  id: string;
  kind: ProBookmarkKind;
  title: string;
  /** Peptide compound id when kind === 'peptide'. */
  peptideId?: string;
  /** Guide course id when kind === 'video'. */
  courseId?: string;
  /** Guide lesson id when kind === 'video'. */
  lessonId?: string;
  /** Protocol stack id when kind === 'protocol'. */
  protocolId?: string;
  /** Optional video URL snapshot for offline display. */
  videoUrl?: string | null;
  /** Optional subtitle / duration label. */
  subtitle?: string | null;
  createdAt: string;
};

export type ProBookmarkInput =
  | {
      kind: 'peptide';
      peptideId: string;
      title: string;
      subtitle?: string | null;
    }
  | {
      kind: 'video';
      courseId: string;
      lessonId: string;
      title: string;
      videoUrl?: string | null;
      subtitle?: string | null;
    }
  | {
      kind: 'protocol';
      protocolId: string;
      title: string;
      subtitle?: string | null;
    };

export function peptideBookmarkId(peptideId: string): string {
  return `peptide_${peptideId}`;
}

export function videoBookmarkId(courseId: string, lessonId: string): string {
  return `video_${courseId}_${lessonId}`;
}

export function protocolBookmarkId(protocolId: string): string {
  return `protocol_${protocolId}`;
}

export function bookmarkIdForInput(input: ProBookmarkInput): string {
  if (input.kind === 'peptide') return peptideBookmarkId(input.peptideId);
  if (input.kind === 'video') return videoBookmarkId(input.courseId, input.lessonId);
  return protocolBookmarkId(input.protocolId);
}
