import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { KNOWLEDGE_COMPOUNDS } from '../src/data/knowledge/compounds';

const lite = KNOWLEDGE_COMPOUNDS.map((compound) => ({
  id: compound.id,
  name: compound.name,
  aliases: compound.aliases,
  isPeptide: compound.isPeptide,
  classification: compound.classification,
  categories: compound.categories,
  summary: compound.summary,
  proposedMechanism: compound.proposedMechanism,
  researchNotes: compound.researchNotes,
  humanEvidenceGrade: compound.humanEvidenceGrade,
  preclinicalEvidenceGrade: compound.preclinicalEvidenceGrade,
  regulatoryStatus: compound.regulatoryStatus,
  regulatoryDetail: compound.regulatoryDetail,
  researchAreas: compound.researchAreas,
  risks: compound.risks,
  uncertainties: compound.uncertainties,
  knownAdverseEffects: compound.knownAdverseEffects,
  references: compound.references,
  lastReviewedAt: compound.lastReviewedAt,
}));

const outPath = join(process.cwd(), 'functions/src/knowledge/compounds.json');
writeFileSync(outPath, JSON.stringify(lite, null, 2));
console.log(`Wrote ${lite.length} compounds to ${outPath}`);
