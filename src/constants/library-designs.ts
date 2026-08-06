export const LIBRARY_DESIGN_IDS = [
  'relay',
  'specimen',
  'harbor',
  'kinetic',
  'bloom',
] as const;

export type LibraryDesignId = (typeof LIBRARY_DESIGN_IDS)[number];

export const LIBRARY_DESIGNS: Array<{
  id: LibraryDesignId;
  label: string;
  blurb: string;
}> = [
  {
    id: 'relay',
    label: 'Relay',
    blurb: 'Sticky category rail + streaming compound list',
  },
  {
    id: 'specimen',
    label: 'Specimen',
    blurb: 'Museum mounts with monogram plates',
  },
  {
    id: 'harbor',
    label: 'Harbor',
    blurb: 'Wide landscape bands and quiet typography',
  },
  {
    id: 'kinetic',
    label: 'Kinetic',
    blurb: 'Giant category watermarks over a tight grid',
  },
  {
    id: 'bloom',
    label: 'Bloom',
    blurb: 'Soft pods with ribbon category headers',
  },
];

export const DEFAULT_LIBRARY_DESIGN: LibraryDesignId = 'relay';
