/**
 * Peptides shown on All Peptides as “Coming soon” until catalog pages/offers exist.
 * Skipped here if the same compound already has live vendor offers.
 */
export type ComingSoonPeptide = {
  id: string;
  name: string;
  aliases?: string[];
};

export const COMING_SOON_PEPTIDES: ComingSoonPeptide[] = [
  { id: 'adipotide', name: 'Adipotide' },
  { id: 'matrixyl', name: 'Matrixyl' },
  { id: 'gonadorelin', name: 'Gonadorelin' },
  { id: 'mif-1', name: 'MIF-1', aliases: ['MIF1', 'Melanocyte-inhibiting factor'] },
  {
    id: 'n-acetyl-epithalon',
    name: 'N-Acetyl Epithalon',
    aliases: ['N-Acetyl Epitalon', 'Acetyl Epithalon'],
  },
  { id: 'vip', name: 'VIP', aliases: ['Vasoactive Intestinal Peptide'] },
  { id: 'fgl', name: 'FGL', aliases: ['FG Loop peptide'] },
  { id: 'pnc-27', name: 'PNC-27' },
  { id: 'igf-1-des', name: 'IGF-1 DES', aliases: ['IGF-1 Des', 'Des(1-3)IGF-1'] },
  { id: 'colivelin', name: 'Colivelin' },
  {
    id: 'hexarelin-acetate',
    name: 'Hexarelin Acetate',
    aliases: ['Hexarelin'],
  },
  { id: 'dermorphin', name: 'Dermorphin' },
  { id: 'pal-ghk', name: 'PAL-GHK', aliases: ['Palmitoyl GHK', 'Pal-GHK'] },
  { id: 'lipopeptide', name: 'Lipopeptide' },
  { id: 'retinalamin', name: 'Retinalamin' },
  {
    id: 'mgf',
    name: 'MGF (Mechano Growth Factor)',
    aliases: ['MGF', 'Mechano Growth Factor', 'IGF-1Ec'],
  },
  { id: 'humanin', name: 'Humanin' },
  { id: 'b7-33', name: 'B7-33' },
  { id: 'aicar', name: 'AICAR', aliases: ['Acadesine'] },
  {
    id: 'n-acetyl-semax-amidate',
    name: 'N-Acetyl Semax Amidate',
    aliases: ['NASA', 'Adamax'],
  },
  {
    id: 'alarelin-acetate',
    name: 'Alarelin Acetate',
    aliases: ['Alarelin'],
  },
  { id: 'dnsp-11', name: 'DNSP-11' },
  { id: 'argireline', name: 'Argireline', aliases: ['Acetyl Hexapeptide-8'] },
  { id: 'acth-1-34', name: 'ACTH 1-34', aliases: ['ACTH(1-34)'] },
  { id: 'orexin-a', name: 'Orexin A', aliases: ['Hypocretin-1'] },
  {
    id: 'protirelin',
    name: 'Protirelin (TRH Thyrotropin)',
    aliases: ['Protirelin', 'TRH', 'Thyrotropin-releasing hormone'],
  },
  {
    id: 'triptorelin',
    name: 'Triptorelin (GnRH)',
    aliases: ['Triptorelin', 'GnRH agonist'],
  },
  {
    id: 'thymagen',
    name: 'Thymagen',
    aliases: ['Thymogen', 'Thymogen peptide'],
  },
  { id: 'hng', name: 'HNG', aliases: ['Humanin G', 'S14G-Humanin'] },
  {
    id: 'ghrelin-acetate',
    name: 'Ghrelin Acetate',
    aliases: ['Ghrelin'],
  },
  {
    id: 'ac-semax-nh2',
    name: 'AC-Semax NH2',
    aliases: ['AC-Semax', 'Acetyl Semax NH2'],
  },
  {
    id: 'thymalfasin',
    name: 'Thymalfasin',
    aliases: ['Thymosin Alpha-1', 'TA1'],
  },
  { id: 'ptd-dbm', name: 'PTD-DBM' },
  { id: 'hep-1', name: 'HEP-1' },
  { id: 'crystagen', name: 'Crystagen' },
  { id: 'leptin-22-56', name: 'Leptin 22-56', aliases: ['Leptin (22-56)'] },
  {
    id: 'teriparatide',
    name: 'Teriparatide (PTH 1-34)',
    aliases: ['Teriparatide', 'PTH 1-34', 'PTH(1-34)'],
  },
  // EPO skipped — glycoprotein hormone (same bucket as insulin / GH), not listing.
  { id: 'syn-ake', name: 'Syn-Ake', aliases: ['Synake', 'Dipeptide diaminobutyroyl'] },
  { id: 'orexin-b', name: 'Orexin B', aliases: ['Hypocretin-2'] },
  { id: 'thyroidget', name: 'Thyroidget', aliases: ['Thyroidgen'] },
  { id: 'follistatin-315', name: 'Follistatin 315', aliases: ['Follistatin-315', 'FST-315'] },
  { id: 'deslorelin', name: 'Deslorelin' },
];
