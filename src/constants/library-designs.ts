export const LIBRARY_DESIGN_IDS = [
  'deck',
  'market',
  'stack',
  'tile',
  'ledger',
] as const;

export type LibraryDesignId = (typeof LIBRARY_DESIGN_IDS)[number];

export const LIBRARY_DESIGNS: Array<{
  id: LibraryDesignId;
  label: string;
  blurb: string;
}> = [
  {
    id: 'deck',
    label: 'Deck',
    blurb: 'Soft compound cards with a neat vendor price grid underneath',
  },
  {
    id: 'market',
    label: 'Market',
    blurb: 'Bold marketplace cards and dense vendor tiles',
  },
  {
    id: 'stack',
    label: 'Stack',
    blurb: 'Full-width cards with a horizontal vendor strip',
  },
  {
    id: 'tile',
    label: 'Tile',
    blurb: 'Compact two-column mosaic of peptide + vendor mini-grids',
  },
  {
    id: 'ledger',
    label: 'Ledger',
    blurb: 'Clean list cards with a structured vendor price board',
  },
];

export const DEFAULT_LIBRARY_DESIGN: LibraryDesignId = 'tile';
