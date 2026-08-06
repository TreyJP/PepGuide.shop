import type { Peptide } from '@/src/types';

export type LibrarySection = {
  category: string;
  items: Peptide[];
};

export type LibraryDesignViewProps = {
  query: string;
  onQueryChange: (value: string) => void;
  loading: boolean;
  sections: LibrarySection[];
  totalCount: number;
};
