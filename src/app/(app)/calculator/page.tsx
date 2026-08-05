'use client';

import { useMemo, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import {
  calculateReconstitution,
  formatAmount,
} from '@/src/lib/reconstitution';

function parsePositive(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export default function CalculatorPage() {
  const [vialMg, setVialMg] = useState('5');
  const [waterMl, setWaterMl] = useState('2');
  const [doseMcg, setDoseMcg] = useState('250');

  const result = useMemo(
    () =>
      calculateReconstitution({
        vialMg: parsePositive(vialMg),
        waterMl: parsePositive(waterMl),
        doseMcg: parsePositive(doseMcg),
      }),
    [doseMcg, vialMg, waterMl],
  );

  return (
    <div className="h-full overflow-y-auto">
      <header className="border-b border-border px-4 py-4 sm:px-6 sm:py-5">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Calculator
        </h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          Estimate concentration and syringe draw volume after reconstituting a lyophilized vial.
        </p>
      </header>

      <div className="mx-auto grid max-w-3xl gap-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Reconstitution inputs</CardTitle>
            <CardDescription>
              Enter vial strength, diluent volume, and your intended research dose.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Peptide in vial (mg)"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              value={vialMg}
              onChange={(event) => setVialMg(event.target.value)}
              hint="Label amount, e.g. 5 mg"
            />
            <Input
              label="Water added (mL)"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.1"
              value={waterMl}
              onChange={(event) => setWaterMl(event.target.value)}
              hint="Bacteriostatic or sterile water"
            />
            <Input
              label="Desired dose (mcg)"
              type="number"
              inputMode="decimal"
              min={0}
              step="1"
              value={doseMcg}
              onChange={(event) => setDoseMcg(event.target.value)}
              hint="1 mg = 1000 mcg"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>
              Based on a U-100 insulin syringe (100 units = 1 mL).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result ? (
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[12px] bg-surface-secondary px-4 py-3">
                  <dt className="text-xs text-foreground-secondary">Concentration</dt>
                  <dd className="mt-1 text-lg font-semibold text-foreground">
                    {formatAmount(result.concentrationMgPerMl, 3)} mg/mL
                  </dd>
                  <dd className="text-sm text-foreground-secondary">
                    {formatAmount(result.concentrationMcgPerMl, 0)} mcg/mL
                  </dd>
                </div>
                <div className="rounded-[12px] bg-surface-secondary px-4 py-3">
                  <dt className="text-xs text-foreground-secondary">Draw volume</dt>
                  <dd className="mt-1 text-lg font-semibold text-foreground">
                    {formatAmount(result.drawMl, 3)} mL
                  </dd>
                  <dd className="text-sm text-foreground-secondary">
                    {formatAmount(result.insulinUnits, 1)} units on a U-100 syringe
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-foreground-secondary">
                Enter positive numbers for vial amount, water volume, and dose to see results.
              </p>
            )}
          </CardContent>
        </Card>

        <p className="text-xs leading-relaxed text-foreground-secondary">
          Educational math tool only. PepGuide does not provide medical advice, dosing guidance,
          or instructions for human use. Verify vial labeling and follow applicable research
          protocols and professional supervision.
        </p>
      </div>
    </div>
  );
}
