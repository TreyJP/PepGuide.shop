'use client';

import { useMemo, useState, type CSSProperties } from 'react';

import '@/src/components/calculator/calculator-designs.css';
import { Input } from '@/src/components/ui/input';
import {
  calculateReconstitution,
  formatAmount,
} from '@/src/lib/reconstitution';

function parsePositive(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

export function CalculatorWorkspace() {
  const [vialMg, setVialMg] = useState('5');
  const [waterMl, setWaterMl] = useState('2');
  const [doseMg, setDoseMg] = useState('0.25');

  const result = useMemo(() => {
    const doseMgValue = parsePositive(doseMg);
    return calculateReconstitution({
      vialMg: parsePositive(vialMg),
      waterMl: parsePositive(waterMl),
      // Engine still works in mcg; convert the mg dose the user enters.
      doseMcg: doseMgValue * 1000,
    });
  }, [doseMg, vialMg, waterMl]);

  const progress = result
    ? Math.min(100, Math.max(0, (result.insulinUnits / 100) * 100))
    : 0;

  return (
    <div className="calc-root h-full">
      <div className="calc-gauge">
        <div className="calc-gauge__hero calc-rise">
          <h1>Calculator</h1>
        </div>

        <div
          className="calc-gauge__ring-wrap calc-rise"
          style={{ animationDelay: '60ms' }}
        >
          <div
            className="calc-gauge__ring"
            style={{ '--progress': progress } as CSSProperties}
            aria-label={
              result
                ? `${formatAmount(result.insulinUnits, 1)} insulin units`
                : 'No result yet'
            }
          >
            <div className="calc-gauge__center">
              <strong>
                {result ? formatAmount(result.insulinUnits, 1) : '—'}
              </strong>
              <span>U-100 units</span>
            </div>
          </div>
        </div>

        <div
          className="calc-gauge__panel calc-rise"
          style={{ animationDelay: '120ms' }}
        >
          <div className="calc-gauge__controls grid gap-3 sm:grid-cols-3">
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
              label="Desired dose (mg)"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              value={doseMg}
              onChange={(event) => setDoseMg(event.target.value)}
              hint="e.g. 0.25 mg"
            />
          </div>

          {result ? (
            <dl className="calc-gauge__stats">
              <div>
                <dt>Draw volume</dt>
                <dd>
                  {formatAmount(result.drawMl, 3)} mL (
                  {formatAmount(result.insulinUnits, 1)} units)
                </dd>
              </div>
              <div>
                <dt>Concentration</dt>
                <dd>{formatAmount(result.concentrationMgPerMl, 3)} mg/mL</dd>
              </div>
            </dl>
          ) : (
            <p className="calc-empty text-center">
              Enter vial, water, and dose to fill the gauge.
            </p>
          )}
        </div>

        <p className="calc-disclaimer">
          Educational math tool only. PepGuide does not provide medical advice
          or instructions for human use.
        </p>
      </div>
    </div>
  );
}
