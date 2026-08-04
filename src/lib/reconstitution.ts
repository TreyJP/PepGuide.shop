export type ReconstitutionInput = {
  vialMg: number;
  waterMl: number;
  doseMcg: number;
};

export type ReconstitutionResult = {
  concentrationMgPerMl: number;
  concentrationMcgPerMl: number;
  drawMl: number;
  insulinUnits: number;
};

export function calculateReconstitution(
  input: ReconstitutionInput,
): ReconstitutionResult | null {
  const { vialMg, waterMl, doseMcg } = input;
  if (
    !Number.isFinite(vialMg) ||
    !Number.isFinite(waterMl) ||
    !Number.isFinite(doseMcg) ||
    vialMg <= 0 ||
    waterMl <= 0 ||
    doseMcg <= 0
  ) {
    return null;
  }

  const concentrationMgPerMl = vialMg / waterMl;
  const concentrationMcgPerMl = concentrationMgPerMl * 1000;
  const drawMl = doseMcg / concentrationMcgPerMl;
  const insulinUnits = drawMl * 100; // U-100 insulin syringe

  return {
    concentrationMgPerMl,
    concentrationMcgPerMl,
    drawMl,
    insulinUnits,
  };
}

export function formatAmount(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '—';
  return Number(value.toFixed(digits)).toString();
}
