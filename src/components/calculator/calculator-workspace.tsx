'use client';

import { useMemo, useState, type CSSProperties } from 'react';

import '@/src/components/calculator/calculator-designs.css';
import { Input } from '@/src/components/ui/input';
import {
  calculateReconstitution,
  formatAmount,
} from '@/src/lib/reconstitution';

type MassUnit = 'mg' | 'mcg';

function parsePositive(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function convertMass(value: string, from: MassUnit, to: MassUnit): string {
  if (from === to) return value;
  const amount = parsePositive(value);
  if (!Number.isFinite(amount)) return value;
  const next = from === 'mg' ? amount * 1000 : amount / 1000;
  return formatAmount(next, to === 'mcg' ? 1 : 4);
}

function toMg(amount: number, unit: MassUnit): number {
  return unit === 'mg' ? amount : amount / 1000;
}

function MassUnitToggle({
  value,
  onChange,
  label,
}: {
  value: MassUnit;
  onChange: (next: MassUnit) => void;
  label: string;
}) {
  return (
    <div className="calc-gauge__units-toggle" role="group" aria-label={label}>
      <button
        type="button"
        data-active={value === 'mg'}
        aria-pressed={value === 'mg'}
        onClick={() => onChange('mg')}
      >
        mg
      </button>
      <button
        type="button"
        data-active={value === 'mcg'}
        aria-pressed={value === 'mcg'}
        onClick={() => onChange('mcg')}
      >
        mcg
      </button>
    </div>
  );
}

export function CalculatorWorkspace() {
  const [vialUnit, setVialUnit] = useState<MassUnit>('mg');
  const [doseUnit, setDoseUnit] = useState<MassUnit>('mg');
  const [vialAmount, setVialAmount] = useState('5');
  const [waterMl, setWaterMl] = useState('2');
  const [doseAmount, setDoseAmount] = useState('0.25');

  const result = useMemo(() => {
    const vialMg = toMg(parsePositive(vialAmount), vialUnit);
    const doseMg = toMg(parsePositive(doseAmount), doseUnit);
    return calculateReconstitution({
      vialMg,
      waterMl: parsePositive(waterMl),
      doseMcg: doseMg * 1000,
    });
  }, [doseAmount, doseUnit, vialAmount, vialUnit, waterMl]);

  const progress = result
    ? Math.min(100, Math.max(0, (result.insulinUnits / 100) * 100))
    : 0;

  const switchVialUnit = (next: MassUnit) => {
    setVialAmount((current) => convertMass(current, vialUnit, next));
    setVialUnit(next);
  };

  const switchDoseUnit = (next: MassUnit) => {
    setDoseAmount((current) => convertMass(current, doseUnit, next));
    setDoseUnit(next);
  };

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
            <div className="flex w-full flex-col gap-1.5">
              <Input
                id="calc-vial"
                label="Peptide in vial"
                type="number"
                inputMode="decimal"
                min={0}
                step={vialUnit === 'mg' ? '0.1' : '50'}
                value={vialAmount}
                onChange={(event) => setVialAmount(event.target.value)}
              />
              <MassUnitToggle
                value={vialUnit}
                onChange={switchVialUnit}
                label="Vial unit"
              />
            </div>
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
            <div className="flex w-full flex-col gap-1.5">
              <Input
                id="calc-dose"
                label="Desired dose"
                type="number"
                inputMode="decimal"
                min={0}
                step={doseUnit === 'mg' ? '0.01' : '10'}
                value={doseAmount}
                onChange={(event) => setDoseAmount(event.target.value)}
              />
              <MassUnitToggle
                value={doseUnit}
                onChange={switchDoseUnit}
                label="Dose unit"
              />
            </div>
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
                <dd>
                  {formatAmount(result.concentrationMgPerMl, 3)} mg/mL (
                  {formatAmount(result.concentrationMcgPerMl, 1)} mcg/mL)
                </dd>
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
