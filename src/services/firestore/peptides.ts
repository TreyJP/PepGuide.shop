import { MOCK_PEPTIDES } from '@/src/data/peptides';
import type { EvidenceGrade, Peptide, RegulatoryStatus } from '@/src/types';

export type PeptideFilters = {
  query?: string;
  category?: string;
  evidenceGrade?: EvidenceGrade;
  regulatoryStatus?: RegulatoryStatus;
  sort?: 'alpha' | 'evidence' | 'recent';
};

export const peptideRepository = {
  async list(filters: PeptideFilters = {}): Promise<Peptide[]> {
    let results = [...MOCK_PEPTIDES];
    const query = filters.query?.trim().toLowerCase();

    if (query) {
      const compactQuery = query.replace(/[^a-z0-9]+/g, '');
      results = results.filter((peptide) => {
        const compactId = peptide.id.replace(/[^a-z0-9]+/gi, '').toLowerCase();
        return (
          peptide.id.toLowerCase().includes(query) ||
          (compactQuery.length >= 2 && compactId.includes(compactQuery)) ||
          peptide.name.toLowerCase().includes(query) ||
          peptide.aliases.some((alias) => alias.toLowerCase().includes(query)) ||
          peptide.shortDescription.toLowerCase().includes(query) ||
          peptide.researchCategories.some((category) =>
            category.toLowerCase().includes(query),
          )
        );
      });
    }

    if (filters.category) {
      results = results.filter((peptide) =>
        peptide.researchCategories.includes(filters.category!),
      );
    }

    if (filters.evidenceGrade) {
      results = results.filter(
        (peptide) => peptide.humanEvidenceGrade === filters.evidenceGrade,
      );
    }

    if (filters.regulatoryStatus) {
      results = results.filter(
        (peptide) => peptide.regulatoryStatus === filters.regulatoryStatus,
      );
    }

    switch (filters.sort) {
      case 'evidence':
        results.sort((a, b) =>
          a.humanEvidenceGrade.localeCompare(b.humanEvidenceGrade),
        );
        break;
      case 'recent':
        results.sort(
          (a, b) => +new Date(b.lastReviewedAt) - +new Date(a.lastReviewedAt),
        );
        break;
      default:
        results.sort((a, b) => a.name.localeCompare(b.name));
    }

    return results;
  },

  async getById(peptideId: string): Promise<Peptide | null> {
    return MOCK_PEPTIDES.find((peptide) => peptide.id === peptideId) ?? null;
  },

  async getByIds(peptideIds: string[]): Promise<Peptide[]> {
    return MOCK_PEPTIDES.filter((peptide) => peptideIds.includes(peptide.id));
  },

  categories(): string[] {
    return Array.from(
      new Set(MOCK_PEPTIDES.flatMap((peptide) => peptide.researchCategories)),
    ).sort();
  },
};
