/** Seven COA-style checks shown as e.g. 5/7 or -/7 when unreported. */
export const PARTNER_LAB_TESTS = [
  { id: 'net_content', label: 'Net content' },
  { id: 'net_purity', label: 'Net purity' },
  { id: 'identification', label: 'Identification' },
  { id: 'endotoxins', label: 'Endotoxins' },
  { id: 'sterility', label: 'Sterility' },
  { id: 'heavy_metals', label: 'Heavy metals' },
  { id: 'fentanyl', label: 'Fentanyl testing' },
] as const;

export type PartnerLabTestId = (typeof PARTNER_LAB_TESTS)[number]['id'];

export type PartnerLabTestResult = {
  id: PartnerLabTestId;
  label: string;
  /** true = passed / reported, false = failed, null = not reported */
  status: boolean | null;
};

export type PartnerLabPanel = {
  vendorId: string;
  results: PartnerLabTestResult[];
  /** Passed count when any results are known; null means unreported panel. */
  passedCount: number | null;
  total: number;
  /** Display like "3/7" or "-/7" when unknown. */
  scoreLabel: string;
};

const TOTAL = PARTNER_LAB_TESTS.length;

function scoreLabel(passedCount: number | null): string {
  if (passedCount == null) return `-/${TOTAL}`;
  return `${passedCount}/${TOTAL}`;
}

export function buildPartnerLabPanel(
  vendorId: string,
  labTests?: Partial<Record<PartnerLabTestId, boolean | null>> | null,
): PartnerLabPanel {
  const results = PARTNER_LAB_TESTS.map((test) => ({
    id: test.id,
    label: test.label,
    status:
      labTests?.[test.id] === true || labTests?.[test.id] === false
        ? labTests[test.id]!
        : null,
  }));

  const reported = results.filter((result) => result.status !== null);
  const passedCount =
    reported.length === 0
      ? null
      : results.filter((result) => result.status === true).length;

  return {
    vendorId,
    results,
    passedCount,
    total: TOTAL,
    scoreLabel: scoreLabel(passedCount),
  };
}

/** @deprecated Prefer buildPartnerLabPanel with live partner data. */
export function getPartnerLabPanel(vendorId: string): PartnerLabPanel {
  return buildPartnerLabPanel(vendorId, null);
}

/** Numeric score for sorting — unknown panels rank below 0. */
export function getPartnerLabSortScore(
  vendorId: string,
  labTests?: Partial<Record<PartnerLabTestId, boolean | null>> | null,
): number {
  return buildPartnerLabPanel(vendorId, labTests).passedCount ?? -1;
}
