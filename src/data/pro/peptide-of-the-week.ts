/**
 * Featured “Peptide of the week” teaser shown across the app.
 * Update weekly — videoUrl can be YouTube, Vimeo, or a direct mp4.
 * Set enabled to true when a video is ready.
 */
export const PEPTIDE_OF_WEEK_BANNER_ENABLED = false;

export type PeptideOfTheWeek = {
  peptideId: string;
  name: string;
  weekLabel: string;
  headline: string;
  blurb: string;
  /** Featured education video for the modal. */
  videoUrl: string;
  /** Optional poster for file videos. */
  posterUrl?: string;
};

export const PEPTIDE_OF_THE_WEEK: PeptideOfTheWeek = {
  peptideId: 'retatrutide',
  name: 'Retatrutide',
  weekLabel: 'This week’s peptide',
  headline: 'Retatrutide — metabolic research in focus',
  blurb:
    'A short educational look at how researchers discuss retatrutide’s multi-receptor profile, evidence framing, and open questions.',
  // Replace with your hosted education video when ready.
  videoUrl:
    process.env.NEXT_PUBLIC_PEPTIDE_OF_WEEK_VIDEO_URL?.trim() ||
    process.env.NEXT_PUBLIC_PRO_EXPLAINER_VIDEO_URL?.trim() ||
    '',
  posterUrl:
    process.env.NEXT_PUBLIC_PEPTIDE_OF_WEEK_VIDEO_POSTER?.trim() ||
    process.env.NEXT_PUBLIC_PRO_EXPLAINER_VIDEO_POSTER?.trim() ||
    '',
};
