import type { KnowledgeCompound } from './types';

const REV = '2026-08-03';

export const KNOWLEDGE_COMPOUNDS: KnowledgeCompound[] = [
  // ─── Metabolic / Weight ───────────────────────────────────────────────────
  {
    id: 'retatrutide',
    name: 'Retatrutide',
    aliases: ['LY3437943', 'Triple agonist'],
    isPeptide: true,
    classification: 'Investigational triple incretin/glucagon receptor agonist peptide',
    categories: ['metabolic_weight'],
    summary:
      'An investigational triple-agonist peptide that has shown substantial weight loss and metabolic improvements in phase 2 trials, though it remains unapproved.',
    proposedMechanism:
      'Simultaneously activates GLP-1, GIP, and glucagon receptors, potentially amplifying effects on appetite, energy expenditure, and glycemic control beyond single- or dual-agonist approaches.',
    researchNotes:
      'Retatrutide (LY3437943) is among the most discussed investigational obesity agents. Phase 2 data published in NEJM (2023) reported mean weight reductions approaching 24% at higher doses over 48 weeks, alongside improvements in blood pressure, lipids, and liver fat. Researchers have studied its triple-receptor profile as a rationale for superior efficacy versus GLP-1-only agents. Human evidence remains limited to controlled trials; long-term cardiovascular and safety outcomes are still being characterized in ongoing phase 3 programs. Regulatory status is investigational worldwide.',
    humanEvidenceGrade: 'moderate_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'investigational',
    regulatoryDetail: 'Not FDA approved; in phase 3 development for obesity and related metabolic conditions.',
    researchAreas: ['Obesity', 'Type 2 diabetes', 'MASLD/NAFLD', 'Cardiometabolic risk'],
    risks: ['Gastrointestinal tolerability', 'Investigational safety profile incomplete', 'Heart rate increases reported in trials'],
    uncertainties: ['Long-term durability beyond 48 weeks', 'Comparative effectiveness vs approved dual agonists', 'Optimal patient selection undefined'],
    knownAdverseEffects: ['Nausea', 'Diarrhea', 'Vomiting', 'Constipation', 'Increased heart rate'],
    references: [
      { id: 'reta-1', title: 'Triple-Hormone-Receptor Agonist Retatrutide for Obesity — A Phase 2 Trial', authors: 'Jastreboff AM et al.', year: 2023, journal: 'NEJM', evidenceType: 'human' },
      { id: 'reta-2', title: 'Retatrutide pharmacology and receptor binding profile', authors: 'Multiple authors', year: 2022, journal: 'Diabetes Obes Metab', evidenceType: 'in_vitro' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'cagrilintide',
    name: 'Cagrilintide',
    aliases: ['AM833', 'Long-acting amylin analog'],
    isPeptide: true,
    classification: 'Long-acting amylin receptor agonist peptide',
    categories: ['metabolic_weight'],
    summary:
      'A long-acting amylin analog studied for appetite suppression and weight loss, often in combination with GLP-1 agonists.',
    proposedMechanism:
      'Activates amylin receptors, slowing gastric emptying and reducing meal size; complementary to GLP-1 pathway effects on satiety.',
    researchNotes:
      'Cagrilintide mimics amylin, a pancreatic co-secreted hormone involved in satiety signaling. Researchers have studied it alone and combined with semaglutide (CagriSema) in phase 2/3 programs. Available evidence suggests additive weight loss versus GLP-1 monotherapy in trial populations. Human evidence remains limited to clinical trial settings; approval status is investigational.',
    humanEvidenceGrade: 'moderate_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'investigational',
    regulatoryDetail: 'Investigational; combination with semaglutide under regulatory review in some regions.',
    researchAreas: ['Obesity', 'Combination incretin therapy'],
    risks: ['GI effects', 'Combination therapy complexity', 'Incomplete long-term data'],
    uncertainties: ['Standalone vs combination benefit', 'Regulatory timeline'],
    knownAdverseEffects: ['Nausea', 'Vomiting', 'Diarrhea', 'Injection-site reactions'],
    references: [
      { id: 'cagri-1', title: 'Cagrilintide plus semaglutide in obesity — phase 2 results', authors: 'Enebo LB et al.', year: 2021, journal: 'Lancet', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'semaglutide',
    name: 'Semaglutide',
    aliases: ['Ozempic', 'Wegovy', 'Rybelsus', 'GLP-1 RA'],
    isPeptide: true,
    classification: 'GLP-1 receptor agonist peptide',
    categories: ['metabolic_weight'],
    summary:
      'A GLP-1 receptor agonist with strong human evidence for glycemic control and chronic weight management in approved populations.',
    proposedMechanism:
      'Activates GLP-1 receptors, enhancing glucose-dependent insulin secretion, suppressing glucagon, slowing gastric emptying, and reducing appetite via central and peripheral pathways.',
    researchNotes:
      'Semaglutide is one of the best-characterized incretin peptides. STEP trials demonstrated ~15% mean weight loss at 68 weeks in adults with obesity (STEP 1, NEJM 2021). SUSTAIN and PIONEER programs established glycemic benefits in type 2 diabetes. FDA-approved for specific indications (e.g., Wegovy for chronic weight management, Ozempic for T2D). Researchers continue studying cardiovascular, renal, and MASH outcomes. Compounded or unapproved versions lack equivalent evidence and regulatory oversight.',
    humanEvidenceGrade: 'strong_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'fda_approved_specific',
    regulatoryDetail: 'FDA approved for type 2 diabetes and chronic weight management under product-specific labeling.',
    researchAreas: ['Obesity', 'Type 2 diabetes', 'Cardiovascular outcomes', 'MASH/NAFLD', 'CKD'],
    risks: ['GI intolerance', 'Gallbladder events', 'Thyroid C-cell tumor warning (rodent data)', 'Pancreatitis (rare)'],
    uncertainties: ['Long-term maintenance after discontinuation', 'Pediatric and broader population data evolving'],
    knownAdverseEffects: ['Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Abdominal pain'],
    references: [
      { id: 'sema-1', title: 'Once-Weekly Semaglutide in Adults with Overweight or Obesity (STEP 1)', authors: 'Wilding JPH et al.', year: 2021, journal: 'NEJM', evidenceType: 'human' },
      { id: 'sema-2', title: 'Semaglutide and Cardiovascular Outcomes (SELECT)', authors: 'Lincoff AM et al.', year: 2023, journal: 'NEJM', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'tirzepatide',
    name: 'Tirzepatide',
    aliases: ['Mounjaro', 'Zepbound', 'LY3298176'],
    isPeptide: true,
    classification: 'Dual GIP/GLP-1 receptor agonist peptide',
    categories: ['metabolic_weight'],
    summary:
      'A dual GIP/GLP-1 agonist with among the strongest weight-loss results reported in pivotal obesity trials.',
    proposedMechanism:
      'Co-activates GIP and GLP-1 receptors; combined incretin signaling may produce greater metabolic effects than GLP-1 agonism alone.',
    researchNotes:
      'Tirzepatide SURMOUNT trials reported up to ~22% mean weight loss at 72 weeks (SURMOUNT-1). SURPASS programs demonstrated robust HbA1c reductions in T2D. FDA approved as Mounjaro (T2D) and Zepbound (obesity). Available evidence suggests dual incretin activation is a meaningful advance, though head-to-head long-term comparisons with other agents continue. Human evidence is strong within labeled populations.',
    humanEvidenceGrade: 'strong_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'fda_approved_specific',
    regulatoryDetail: 'FDA approved for type 2 diabetes and chronic weight management.',
    researchAreas: ['Obesity', 'Type 2 diabetes', 'Obstructive sleep apnea', 'MASH'],
    risks: ['GI effects', 'Thyroid C-cell warnings', 'Investigation of aspiration risk with anesthesia'],
    uncertainties: ['Mechanistic contribution of GIP vs GLP-1', 'Discontinuation effects'],
    knownAdverseEffects: ['Nausea', 'Diarrhea', 'Vomiting', 'Constipation', 'Decreased appetite'],
    references: [
      { id: 'tirz-1', title: 'Tirzepatide Once Weekly for the Treatment of Obesity (SURMOUNT-1)', authors: 'Jastreboff AM et al.', year: 2022, journal: 'NEJM', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'mazdutide',
    name: 'Mazdutide',
    aliases: ['IBI362', 'GLP-1/glucagon dual agonist'],
    isPeptide: true,
    classification: 'Investigational GLP-1 and glucagon dual agonist peptide',
    categories: ['metabolic_weight'],
    summary:
      'A dual GLP-1/glucagon agonist in development, studied for weight loss and metabolic effects primarily in Asian populations.',
    proposedMechanism:
      'Dual activation of GLP-1 (satiety, glycemic) and glucagon (energy expenditure, hepatic fat) receptors.',
    researchNotes:
      'Mazdutide (IBI362) has reported meaningful weight loss in phase 2 trials in China. Researchers have studied it as a metabolic dual agonist similar in concept to survodutide and retatrutide components. Human evidence remains limited and region-specific; global regulatory status is investigational.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'investigational',
    regulatoryDetail: 'Investigational; primarily developed in China.',
    researchAreas: ['Obesity', 'Type 2 diabetes', 'Metabolic syndrome'],
    risks: ['GI effects', 'Limited global trial data', 'Glucagon-axis cardiovascular considerations'],
    uncertainties: ['Generalizability outside studied populations', 'Phase 3 outcomes pending'],
    knownAdverseEffects: ['Nausea', 'Vomiting', 'Diarrhea'],
    references: [
      { id: 'mazd-1', title: 'Efficacy and safety of mazdutide in Chinese adults with overweight or obesity', authors: 'Ji L et al.', year: 2023, journal: 'Nat Med', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'survodutide',
    name: 'Survodutide',
    aliases: ['BI 456906', 'GLP-1/glucagon dual agonist'],
    isPeptide: true,
    classification: 'Investigational GLP-1 and glucagon dual agonist peptide',
    categories: ['metabolic_weight'],
    summary:
      'A dual GLP-1/glucagon agonist with promising phase 2 weight-loss and liver-fat data, still investigational.',
    proposedMechanism:
      'Balanced co-agonism at GLP-1 and glucagon receptors to reduce appetite while increasing energy expenditure and improving hepatic lipid metabolism.',
    researchNotes:
      'Survodutide phase 2 data showed substantial weight loss and MASH-related improvements in some cohorts. Researchers have studied glucagon co-agonism for liver fat reduction. Human evidence remains limited to mid-stage trials; regulatory approval has not been granted.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'investigational',
    researchAreas: ['Obesity', 'MASH/NAFLD', 'Type 2 diabetes'],
    risks: ['GI tolerability', 'Heart rate and blood pressure effects under study', 'Incomplete phase 3 data'],
    uncertainties: ['Optimal glucagon/GLP-1 balance', 'Long-term hepatic outcomes'],
    knownAdverseEffects: ['Nausea', 'Diarrhea', 'Vomiting'],
    references: [
      { id: 'survo-1', title: 'Survodutide for obesity and liver fat — phase 2 trial', authors: 'Sanyal AJ et al.', year: 2024, journal: 'Lancet', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'orforglipron',
    name: 'Orforglipron',
    aliases: ['LY3502970', 'Oral GLP-1 RA'],
    isPeptide: false,
    classification: 'Non-peptide oral GLP-1 receptor agonist (small molecule)',
    categories: ['metabolic_weight'],
    summary:
      'An investigational once-daily oral GLP-1 agonist studied for obesity and type 2 diabetes without peptide injection.',
    proposedMechanism:
      'Non-peptide GLP-1 receptor agonism via oral bioavailable small molecule, targeting similar incretin pathways as injectable GLP-1 RAs.',
    researchNotes:
      'Orforglipron represents oral incretin therapy without peptide structure. Phase 2 trials reported meaningful weight loss and glycemic improvements. Researchers have studied it for patient convenience and adherence. Human evidence is moderate but still investigational; not FDA approved. Note: classified as non-peptide despite GLP-1 mechanism overlap with peptide agonists.',
    humanEvidenceGrade: 'moderate_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'investigational',
    researchAreas: ['Obesity', 'Type 2 diabetes', 'Oral incretin therapy'],
    risks: ['GI effects similar to peptide GLP-1 RAs', 'Investigational status', 'Long-term oral safety data pending'],
    uncertainties: ['Efficacy vs injectable benchmarks', 'Phase 3 cardiovascular outcomes'],
    knownAdverseEffects: ['Nausea', 'Vomiting', 'Diarrhea'],
    references: [
      { id: 'orfo-1', title: 'Orforglipron for obesity — phase 2 dose-ranging trial', authors: 'Frias JP et al.', year: 2023, journal: 'NEJM', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'amycretin',
    name: 'Amycretin',
    aliases: ['GLP-1/amylin co-agonist'],
    isPeptide: true,
    classification: 'Investigational GLP-1 and amylin co-agonist peptide',
    categories: ['metabolic_weight'],
    summary:
      'A next-generation co-agonist combining GLP-1 and amylin activity, with strong early-phase weight-loss signals.',
    proposedMechanism:
      'Single molecule or co-formulation targeting both GLP-1 and amylin pathways for enhanced satiety and weight reduction.',
    researchNotes:
      'Amycretin is an early-stage investigational agent from Novo Nordisk combining amylin and GLP-1 agonism. Initial trial data reported rapid and substantial weight loss, generating significant research interest. Human evidence remains early-stage with limited published peer-reviewed data; long-term safety and durability are unknown.',
    humanEvidenceGrade: 'early_stage',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'investigational',
    researchAreas: ['Obesity', 'Combination incretin therapy'],
    risks: ['Very limited long-term human data', 'GI effects anticipated', 'Early development risk'],
    uncertainties: ['Durability of weight loss', 'Comparison with CagriSema and triple agonists'],
    knownAdverseEffects: ['Nausea reported in early trials', 'GI effects expected class effect'],
    references: [
      { id: 'amyc-1', title: 'Amycretin early clinical development overview', authors: 'Novo Nordisk investigators', year: 2024, journal: 'Conference proceedings', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'aod-9604',
    name: 'AOD-9604',
    aliases: ['HGH fragment 176-191', 'Anti-obesity drug fragment'],
    isPeptide: true,
    classification: 'Modified hGH fragment peptide ( investigational fat-loss agent)',
    categories: ['metabolic_weight'],
    summary:
      'A growth hormone fragment peptide marketed for fat loss, but human evidence for meaningful body-composition effects is weak.',
    proposedMechanism:
      'Proposed lipolytic fragment of human growth hormone C-terminal region, theorized to stimulate fat metabolism without full GH effects.',
    researchNotes:
      'AOD-9604 was developed from hGH fragment research. Despite marketing claims, available evidence suggests limited efficacy for fat loss in humans. A TGA review in Australia did not support efficacy claims. Human evidence remains limited and inconsistent; much discussion is anecdotal or preclinical. Often grouped with cosmetic/weight peptides but lacks robust clinical validation.',
    humanEvidenceGrade: 'insufficient',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'not_fda_approved',
    regulatoryDetail: 'Not FDA approved; prohibited in some sports contexts (WADA-related discussions).',
    researchAreas: ['Body composition', 'Lipolysis research'],
    risks: ['Unproven efficacy', 'Unregulated product quality', 'Misleading marketing claims'],
    uncertainties: ['Any clinically meaningful fat-loss effect in humans', 'Nasal and other route bioavailability poorly characterized'],
    knownAdverseEffects: ['Limited systematic adverse event data', 'Headache reported anecdotally'],
    references: [
      { id: 'aod-1', title: 'AOD9604: pharmacological review', authors: 'Heffernan MA et al.', year: 2001, journal: 'Expert Opin Investig Drugs', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'tesofensine',
    name: 'Tesofensine',
    aliases: ['NS2330'],
    isPeptide: false,
    classification: 'Non-peptide triple monoamine reuptake inhibitor ( investigational anti-obesity agent)',
    categories: ['metabolic_weight'],
    summary:
      'A potent appetite-suppressing small molecule with strong phase 2 weight-loss data, limited by cardiovascular and tolerability concerns.',
    proposedMechanism:
      'Inhibits reuptake of norepinephrine, serotonin, and dopamine, reducing appetite and increasing energy expenditure.',
    researchNotes:
      'Tesofensine produced among the highest weight losses in short obesity trials (~10% at 24 weeks in phase 2), but elevated heart rate and blood pressure led to development pauses. Researchers have studied lower doses and combination strategies. Human evidence is moderate for efficacy but regulatory approval has not been achieved due to safety/tolerability balance. Not a peptide.',
    humanEvidenceGrade: 'moderate_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'investigational',
    regulatoryDetail: 'Not FDA approved; development ongoing with reformulation/combination approaches.',
    researchAreas: ['Obesity', 'Appetite regulation'],
    risks: ['Increased heart rate', 'Elevated blood pressure', 'Insomnia', 'Dry mouth', 'Mood effects'],
    uncertainties: ['Whether lower-dose regimens achieve acceptable safety', 'Regulatory path forward'],
    knownAdverseEffects: ['Dry mouth', 'Insomnia', 'Nausea', 'Constipation', 'Increased heart rate'],
    references: [
      { id: 'teso-1', title: 'Tesofensine for obesity — phase 2 trial', authors: 'Astrup A et al.', year: 2008, journal: 'Lancet', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: '5-amino-1mq',
    name: '5-Amino-1MQ',
    aliases: ['5-amino-1-methylquinolinium'],
    isPeptide: false,
    classification: 'Non-peptide NNMT inhibitor (metabolic research compound)',
    categories: ['metabolic_weight'],
    summary:
      'A small-molecule NNMT inhibitor studied preclinically for metabolic and fat-loss effects; human evidence remains very limited.',
    proposedMechanism:
      'Inhibits nicotinamide N-methyltransferase (NNMT), proposed to increase cellular energy expenditure and alter adipocyte metabolism.',
    researchNotes:
      '5-Amino-1MQ has generated interest in longevity and metabolic research communities based on animal data showing reduced adiposity and improved metabolic markers. Human clinical evidence remains limited or absent in peer-reviewed literature. Often discussed alongside peptide metabolic agents but is not itself a peptide. Nasal bioavailability for many such compounds is poorly characterized.',
    humanEvidenceGrade: 'preclinical_only',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'research_stage',
    researchAreas: ['Metabolic research', 'Adipose tissue biology', 'NNMT pathway'],
    risks: ['No established human safety profile', 'Unregulated research chemical status', 'Unknown long-term effects'],
    uncertainties: ['Translation to humans', 'Any meaningful clinical metabolic effect'],
    knownAdverseEffects: ['Insufficient human systematic data'],
    references: [
      { id: '5amq-1', title: 'An NNMT inhibitor reduces adiposity in diet-induced obese mice', authors: 'Kraus D et al.', year: 2014, journal: 'Nat Chem Biol', evidenceType: 'animal' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'mots-c',
    name: 'MOTS-c',
    aliases: ['Mitochondrial open reading frame peptide'],
    isPeptide: true,
    classification: 'Mitochondrial-derived peptide (metabolic exercise mimetic research)',
    categories: ['metabolic_weight', 'gh_secretagogues'],
    summary:
      'A mitochondrial-encoded peptide studied for metabolic and exercise-mimetic effects; human evidence remains emerging and limited.',
    proposedMechanism:
      'Activates AMPK and regulates nuclear gene expression related to glucose and fatty acid metabolism; proposed exercise-mimetic effects.',
    researchNotes:
      'MOTS-c is endogenously produced and declines with age in some studies. Animal models show improved insulin sensitivity and exercise capacity. Early human studies explore metabolic effects in sedentary adults. Available evidence suggests biological plausibility but human evidence remains limited. Frequently discussed in biohacking contexts without robust clinical validation.',
    humanEvidenceGrade: 'early_stage',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'research_stage',
    researchAreas: ['Metabolic syndrome', 'Exercise physiology', 'Aging research'],
    risks: ['Limited human safety data', 'Unregulated product variability', 'Unknown long-term effects'],
    uncertainties: ['Clinical efficacy in humans', 'Optimal research contexts'],
    knownAdverseEffects: ['Insufficient systematic human AE reporting'],
    references: [
      { id: 'mots-1', title: 'The mitochondrial-derived peptide MOTS-c promotes metabolic homeostasis', authors: 'Lee C et al.', year: 2015, journal: 'Cell Metab', evidenceType: 'animal' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'tesamorelin',
    name: 'Tesamorelin',
    aliases: ['Egrifta', 'TH9507'],
    isPeptide: true,
    classification: 'GHRH analog peptide (FDA-approved for HIV-associated lipodystrophy)',
    categories: ['metabolic_weight', 'gh_secretagogues'],
    summary:
      'A GHRH analog FDA-approved for reducing visceral fat in HIV-associated lipodystrophy; also studied for broader metabolic effects.',
    proposedMechanism:
      'Stimulates pituitary growth hormone release, increasing IGF-1 and promoting lipolysis, especially visceral adipose tissue.',
    researchNotes:
      'Tesamorelin is one of the few GH-axis peptides with FDA approval (Egrifta for HIV lipodystrophy). Trials demonstrated significant visceral fat reduction. Researchers have explored broader metabolic and cognitive applications. Human evidence is strong within the approved indication; extrapolation to other populations requires caution. Also categorized as a GH secretagogue.',
    humanEvidenceGrade: 'strong_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'fda_approved_specific',
    regulatoryDetail: 'FDA approved for HIV-associated lipodystrophy (reduction of excess abdominal fat).',
    researchAreas: ['Visceral adiposity', 'HIV lipodystrophy', 'GH axis', 'Cognitive aging research'],
    risks: ['Glucose effects', 'Injection-site reactions', 'Potential IGF-1 related concerns', 'Off-label use lacks evidence'],
    uncertainties: ['Benefit in non-HIV populations', 'Long-term GH-axis effects outside approved use'],
    knownAdverseEffects: ['Injection-site reactions', 'Joint pain', 'Peripheral edema', 'Hyperglycemia'],
    references: [
      { id: 'tesam-1', title: 'Tesamorelin reduces visceral fat in HIV lipodystrophy', authors: 'Falutz J et al.', year: 2010, journal: 'NEJM', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'bam15',
    name: 'BAM15',
    aliases: ['Mitochondrial uncoupler'],
    isPeptide: false,
    classification: 'Non-peptide selective mitochondrial uncoupler (research compound)',
    categories: ['metabolic_weight'],
    summary:
      'A mitochondrial uncoupler that increases energy expenditure in animal models; human clinical evidence is absent.',
    proposedMechanism:
      'Dissipates mitochondrial proton gradient, increasing oxygen consumption and heat production without inhibiting ATP synthase.',
    researchNotes:
      'BAM15 showed dramatic anti-obesity effects in diet-induced obese mice while preserving lean mass. Researchers have studied mitochondrial uncoupling as a metabolic strategy. Human evidence remains preclinical only; safety of systemic uncoupling in humans is unknown. Not a peptide.',
    humanEvidenceGrade: 'preclinical_only',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'research_stage',
    researchAreas: ['Obesity research', 'Mitochondrial biology', 'Energy expenditure'],
    risks: ['Unknown human safety', 'Potential hyperthermia or metabolic stress', 'No clinical trials'],
    uncertainties: ['Any translatable human benefit', 'Therapeutic window'],
    knownAdverseEffects: ['Not characterized in humans'],
    references: [
      { id: 'bam15-1', title: 'BAM15 reverses diet-induced obesity in mice', authors: 'Axelrod CL et al.', year: 2020, journal: 'Nat Commun', evidenceType: 'animal' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'nmn',
    name: 'NMN',
    aliases: ['Nicotinamide mononucleotide', 'NAD+ precursor'],
    isPeptide: false,
    classification: 'Non-peptide NAD+ biosynthesis precursor (nutraceutical/research compound)',
    categories: ['metabolic_weight', 'general'],
    summary:
      'An NAD+ precursor studied for metabolic and aging-related endpoints; modest human data with ongoing research.',
    proposedMechanism:
      'Converted to NAD+ via NMNAT enzymes, supporting sirtuin and PARP activity and mitochondrial function.',
    researchNotes:
      'NMN supplementation has been studied for effects on insulin sensitivity, aerobic capacity, and NAD+ levels in middle-aged adults. Available evidence suggests modest metabolic benefits in some trials but not consistent large effects on body composition. Sold as a supplement; not FDA approved as a drug. Human evidence is limited to small trials.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'not_fda_approved',
    regulatoryDetail: 'Marketed as dietary supplement; not FDA approved as therapeutic agent.',
    researchAreas: ['Aging research', 'Metabolic health', 'NAD+ biology'],
    risks: ['Supplement quality variability', 'Long-term safety incompletely defined', 'Theoretical oncogenesis concerns in preclinical models (debated)'],
    uncertainties: ['Meaningful clinical benefit magnitude', 'Optimal population for research interest'],
    knownAdverseEffects: ['Generally well tolerated in short trials', 'GI upset reported occasionally'],
    references: [
      { id: 'nmn-1', title: 'Nicotinamide mononucleotide increases muscle insulin sensitivity in prediabetic women', authors: 'Yoshino M et al.', year: 2021, journal: 'Science', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'sr9009',
    name: 'SR9009',
    aliases: ['Stenabolic', 'REV-ERB agonist'],
    isPeptide: false,
    classification: 'Non-peptide synthetic REV-ERB agonist (circadian/metabolic research compound)',
    categories: ['metabolic_weight', 'sleep_circadian'],
    summary:
      'A REV-ERB agonist studied preclinically for metabolism and circadian effects; not validated in human clinical trials.',
    proposedMechanism:
      'Agonizes REV-ERBα/β nuclear receptors, modulating circadian rhythm, mitochondrial biogenesis, and lipid/glucose metabolism.',
    researchNotes:
      'SR9009 showed metabolic benefits in mice but has poor oral bioavailability and limited pharmacokinetic data in humans. Preclinical sleep studies suggest REM reduction and circadian phase shifts. Frequently discussed for fat loss despite absent human efficacy evidence. Not a peptide. WADA-prohibited in sports contexts.',
    humanEvidenceGrade: 'preclinical_only',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'research_stage',
    researchAreas: ['Circadian biology', 'Metabolic research', 'Sleep timing'],
    risks: ['No human safety data', 'Sold as unregulated research chemical', 'Misleading performance claims'],
    uncertainties: ['Any human metabolic or sleep effect', 'Bioavailability in humans'],
    knownAdverseEffects: ['Not established in humans'],
    references: [
      { id: 'sr9-1', title: 'Pharmacological activation of REV-ERBs regulates circadian and metabolic networks', authors: 'Solt LA et al.', year: 2012, journal: 'Nature', evidenceType: 'animal' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'sr9011',
    name: 'SR9011',
    aliases: ['REV-ERB agonist'],
    isPeptide: false,
    classification: 'Non-peptide synthetic REV-ERB agonist (circadian/metabolic research compound)',
    categories: ['metabolic_weight', 'sleep_circadian'],
    summary:
      'A REV-ERB agonist related to SR9009, discussed for metabolic and circadian research with only preclinical evidence.',
    proposedMechanism:
      'REV-ERB receptor agonism affecting circadian gene expression and metabolic pathways, similar to SR9009.',
    researchNotes:
      'SR9011 is a close analog of SR9009 with overlapping preclinical profiles. Human clinical evidence is absent. Sleep-related effects are less clearly defined than SR9009 in published literature. Not a peptide.',
    humanEvidenceGrade: 'preclinical_only',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'research_stage',
    researchAreas: ['Circadian biology', 'Metabolic research'],
    risks: ['No human safety profile', 'Unregulated research chemical'],
    uncertainties: ['Human translatability', 'Differentiation from SR9009 clinically'],
    knownAdverseEffects: ['Not established in humans'],
    references: [
      { id: 'sr91-1', title: 'REV-ERB agonists as metabolic modulators', authors: 'Solt LA et al.', year: 2012, journal: 'Nature', evidenceType: 'animal' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'gw501516',
    name: 'GW501516',
    aliases: ['Cardarine', 'Endurobol'],
    isPeptide: false,
    classification: 'Non-peptide PPARδ agonist (discontinued research compound; carcinogenicity in animals)',
    categories: ['metabolic_weight'],
    summary:
      'A PPAR-delta agonist with preclinical endurance and fat-oxidation effects; development halted due to cancer findings in rodents.',
    proposedMechanism:
      'Activates PPARδ, increasing fatty acid oxidation and endurance capacity in animal models.',
    researchNotes:
      'GW501516 demonstrated remarkable endurance effects in mice but Roche/GSK discontinued development after rapid cancer development in rodent toxicity studies. Despite this, it circulates in unregulated markets. Human evidence is essentially absent. Not a peptide. Researchers strongly caution against use given carcinogenicity signals.',
    humanEvidenceGrade: 'preclinical_only',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'withdrawn',
    regulatoryDetail: 'Development discontinued; WADA prohibited; not approved for any indication.',
    researchAreas: ['Endurance physiology', 'Fat oxidation research'],
    risks: ['Carcinogenicity in animal models', 'No human safety data', 'Illegal/unregulated supply'],
    uncertainties: ['Any safe human application'],
    knownAdverseEffects: ['Cancer in rodent models at multiple organ sites'],
    references: [
      { id: 'gw-1', title: 'GW501516 (Cardarine) toxicity and carcinogenicity assessment', authors: 'USADA / WADA documentation', year: 2017, evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'clenbuterol',
    name: 'Clenbuterol',
    aliases: ['Beta-2 agonist bronchodilator'],
    isPeptide: false,
    classification: 'Non-peptide beta-2 adrenergic agonist (not approved for weight loss)',
    categories: ['metabolic_weight'],
    summary:
      'A beta-2 agonist with lipolytic effects in research contexts but significant cardiovascular risks; not an approved fat-loss therapy.',
    proposedMechanism:
      'Beta-2 adrenergic receptor activation increases cyclic AMP, promoting lipolysis and thermogenesis.',
    researchNotes:
      'Clenbuterol is approved as a bronchodilator in some countries (veterinary use common) but not for weight loss. Misused for body composition despite tachycardia, hypokalemia, and cardiac hypertrophy risks. Human evidence for safe fat loss is insufficient; harm reports are documented. Not a peptide.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'not_fda_approved',
    regulatoryDetail: 'Not FDA approved for weight loss; prohibited in food-producing animals in US; WADA banned.',
    researchAreas: ['Adrenergic pharmacology', 'Lipolysis research'],
    risks: ['Tachycardia', 'Arrhythmias', 'Hypokalemia', 'Cardiac hypertrophy', 'Tremor'],
    uncertainties: ['Any safe therapeutic window for metabolic use'],
    knownAdverseEffects: ['Palpitations', 'Tremor', 'Headache', 'Muscle cramps', 'Insomnia'],
    references: [
      { id: 'clen-1', title: 'Adverse effects of clenbuterol misuse: a review', authors: 'Multiple authors', year: 2018, journal: 'Toxicol Lett', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'albuterol',
    name: 'Albuterol',
    aliases: ['Salbutamol', 'Beta-2 agonist'],
    isPeptide: false,
    classification: 'Non-peptide short-acting beta-2 adrenergic agonist (bronchodilator)',
    categories: ['metabolic_weight'],
    summary:
      'A short-acting beta-2 agonist with mild metabolic effects; not established or recommended as a fat-loss intervention.',
    proposedMechanism:
      'Beta-2 receptor activation with modest increases in metabolic rate and lipolysis at bronchodilator doses.',
    researchNotes:
      'Albuterol is FDA-approved for asthma/COPD. Some research explores mild anabolic or lipolytic effects at higher doses, but fat-loss use is not supported by clinical guidelines. Human evidence for body composition is weak. Not a peptide.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'fda_approved_specific',
    regulatoryDetail: 'FDA approved as bronchodilator; not approved for weight management.',
    researchAreas: ['Bronchodilation', 'Adrenergic metabolism research'],
    risks: ['Tachycardia at supratherapeutic use', 'Tremor', 'Misuse for performance enhancement'],
    uncertainties: ['Meaningful fat-loss effect at safe doses'],
    knownAdverseEffects: ['Tremor', 'Tachycardia', 'Headache', 'Nervousness'],
    references: [
      { id: 'alb-1', title: 'Albuterol pharmacology and clinical use', authors: 'Multiple authors', year: 2020, journal: 'Standard pharmacology reference', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'methylene-blue',
    name: 'Methylene Blue',
    aliases: ['Methylthioninium chloride'],
    isPeptide: false,
    classification: 'Non-peptide redox dye / mitochondrial modulator (FDA-approved for methemoglobinemia)',
    categories: ['metabolic_weight', 'general'],
    summary:
      'A mitochondrial modulator with approved medical uses; any indirect metabolic or fat-loss role is speculative and not proven.',
    proposedMechanism:
      'Alternative electron carrier in mitochondrial electron transport chain; modulates oxidative stress and cellular energetics.',
    researchNotes:
      'Methylene blue is FDA-approved at low doses for methemoglobinemia. Low-dose supplementation is discussed in longevity contexts for cognitive and mitochondrial support. Direct fat-loss evidence is absent; any metabolic benefit would be indirect. Not a peptide. High doses carry serotonin syndrome risk with serotonergic drugs.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'fda_approved_specific',
    regulatoryDetail: 'FDA approved for methemoglobinemia; other uses investigational or supplement context.',
    researchAreas: ['Mitochondrial function', 'Cognitive aging research', 'Redox biology'],
    risks: ['Serotonin syndrome with SSRIs/SNRIs', 'G6PD deficiency hemolysis', 'Dose-dependent toxicity'],
    uncertainties: ['Benefit for metabolic or body composition outcomes'],
    knownAdverseEffects: ['Blue discoloration of urine', 'Headache', 'Dizziness', 'Nausea at higher doses'],
    references: [
      { id: 'mb-1', title: 'Low-dose methylene blue: potential neuroprotective agent', authors: 'Tucker D et al.', year: 2018, journal: 'Front Cell Neurosci', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },

  // ─── Healing / Recovery ───────────────────────────────────────────────────
  {
    id: 'bpc-157',
    name: 'BPC-157',
    aliases: ['Body Protection Compound-157', 'Pentadecapeptide BPC 157'],
    isPeptide: true,
    classification: 'Synthetic gastric pentadecapeptide (research-stage healing agent)',
    categories: ['healing_recovery'],
    summary:
      'A healing-focused peptide with extensive preclinical recovery data but very limited controlled human evidence.',
    proposedMechanism:
      'Proposed modulation of growth factor signaling (VEGF, FAK-paxillin), nitric oxide pathways, and cytoprotection in tendon, muscle, and GI tissue.',
    researchNotes:
      'BPC-157 is among the most discussed recovery peptides. Animal studies report accelerated healing of tendons, ligaments, and GI mucosa. Human randomized trials are sparse; much use is anecdotal or outside peer-reviewed literature. WADA prohibits BPC-157. Regulatory status is not FDA approved. Nasal bioavailability for many peptides including BPC-157 is poorly characterized in humans.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'not_fda_approved',
    regulatoryDetail: 'Not FDA approved; prohibited in sport (WADA S0).',
    researchAreas: ['Tendon/ligament repair', 'GI mucosal protection', 'Soft tissue injury research'],
    risks: ['Unproven human efficacy', 'Unregulated product purity', 'Unknown long-term safety'],
    uncertainties: ['Translation from animal models', 'Human dose-response unknown for clinical contexts'],
    knownAdverseEffects: ['Insufficient systematic human AE data', 'Anecdotal reports vary'],
    references: [
      { id: 'bpc-1', title: 'Stable gastric pentadecapeptide BPC 157 in wound healing', authors: 'Sikiric P et al.', year: 2018, journal: 'Curr Pharm Des', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'tb-500',
    name: 'TB-500',
    aliases: ['Thymosin Beta-4 Fragment', 'TB4'],
    isPeptide: true,
    classification: 'Synthetic thymosin beta-4 fragment peptide',
    categories: ['healing_recovery'],
    summary:
      'A regenerative peptide discussed for soft-tissue recovery; human clinical evidence remains primarily preclinical.',
    proposedMechanism:
      'Actin sequestration and cell migration promotion; angiogenesis and anti-inflammatory signaling via thymosin beta-4 pathways.',
    researchNotes:
      'TB-500 derives from thymosin beta-4, which has legitimate pharmaceutical development history (e.g., regeneRx programs). The fragment sold in research markets lacks equivalent clinical validation. Preclinical models show tissue remodeling effects. Human evidence is insufficient for strong conclusions.',
    humanEvidenceGrade: 'preclinical_only',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'research_stage',
    researchAreas: ['Soft tissue repair', 'Wound healing', 'Cardiac repair research'],
    risks: ['Evidence gaps', 'Unregulated products', 'WADA prohibited'],
    uncertainties: ['Fragment vs full TB4 activity', 'Human efficacy for injury recovery'],
    knownAdverseEffects: ['Poorly characterized in humans'],
    references: [
      { id: 'tb-1', title: 'Thymosin beta4: actin-sequestering protein with diverse biological activities', authors: 'Goldstein AL et al.', year: 2005, journal: 'Ann NY Acad Sci', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'ghk-cu',
    name: 'GHK-Cu',
    aliases: ['Copper peptide GHK', 'Copper tripeptide-1'],
    isPeptide: true,
    classification: 'Copper-binding tripeptide (cosmetic and healing research)',
    categories: ['healing_recovery', 'cosmetic_skin', 'hair_research'],
    summary:
      'A copper peptide studied for wound healing, collagen support, and hair follicle biology with mixed human evidence.',
    proposedMechanism:
      'Copper delivery modulates lysyl oxidase, collagen synthesis, antioxidant enzymes, and gene expression related to tissue remodeling.',
    researchNotes:
      'GHK-Cu appears in dermatology and hair research for collagen remodeling and follicle support. Topical cosmetic evidence is moderate; systemic injectable use lacks robust trials. Researchers have studied its anti-inflammatory and wound-healing properties in vitro and in animals. Human evidence varies by route and indication.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'not_fda_approved',
    regulatoryDetail: 'Used in cosmetics; injectable forms not FDA approved as drugs.',
    researchAreas: ['Wound healing', 'Skin aging', 'Hair follicle research', 'Anti-inflammatory signaling'],
    risks: ['Copper toxicity at excessive exposure', 'Product quality variability', 'Limited injectable human data'],
    uncertainties: ['Systemic vs topical efficacy', 'Hair regrowth magnitude in humans'],
    knownAdverseEffects: ['Topical irritation possible', 'Systemic effects poorly documented'],
    references: [
      { id: 'ghk-1', title: 'Regenerative and protective actions of the GHK-Cu peptide', authors: 'Pickart L et al.', year: 2015, journal: 'Biochim Biophys Acta', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'kpv',
    name: 'KPV',
    aliases: ['Lys-Pro-Val', 'Alpha-MSH fragment'],
    isPeptide: true,
    classification: 'Tripeptide alpha-MSH fragment (anti-inflammatory research)',
    categories: ['healing_recovery', 'hair_research'],
    summary:
      'An anti-inflammatory tripeptide studied for gut and skin inflammation with emerging but limited human data.',
    proposedMechanism:
      'MC1R-independent anti-inflammatory signaling; inhibits NF-κB and reduces pro-inflammatory cytokine release.',
    researchNotes:
      'KPV is the C-terminal fragment of alpha-MSH with anti-inflammatory properties in colitis and skin models. Researchers have studied it for IBD and scalp inflammation-related hair loss. Human clinical evidence remains limited. Often discussed for gut healing and inflammatory skin/scalp conditions.',
    humanEvidenceGrade: 'early_stage',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'research_stage',
    researchAreas: ['Inflammatory bowel disease', 'Dermatitis', 'Scalp inflammation'],
    risks: ['Limited human safety data', 'Unregulated supply'],
    uncertainties: ['Clinical efficacy in IBD or hair loss', 'Systemic vs local effects'],
    knownAdverseEffects: ['Insufficient human systematic reporting'],
    references: [
      { id: 'kpv-1', title: 'KPV peptide inhibits NF-kappaB activation in intestinal epithelial cells', authors: 'Kannenganti M et al.', year: 2017, journal: 'Inflamm Bowel Dis', evidenceType: 'in_vitro' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'll-37',
    name: 'LL-37',
    aliases: ['Cathelicidin', 'Human cationic antimicrobial peptide'],
    isPeptide: true,
    classification: 'Endogenous antimicrobial peptide (host defense)',
    categories: ['healing_recovery'],
    summary:
      'A human cathelicidin peptide with antimicrobial and immunomodulatory roles; therapeutic use remains investigational.',
    proposedMechanism:
      'Direct antimicrobial activity, immune cell recruitment, wound healing promotion, and inflammation regulation.',
    researchNotes:
      'LL-37 is endogenously produced and studied for wound healing, infection defense, and inflammatory diseases. Exogenous therapeutic applications are investigational. Effects are context-dependent with potential pro-inflammatory roles at high concentrations. Human evidence for supplemental use is insufficient.',
    humanEvidenceGrade: 'early_stage',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'research_stage',
    researchAreas: ['Wound healing', 'Antimicrobial defense', 'Autoimmune skin conditions'],
    risks: ['Dual pro/anti-inflammatory effects', 'No approved therapeutic formulation'],
    uncertainties: ['Safe exogenous use in humans', 'Indication-specific effects'],
    knownAdverseEffects: ['Local irritation in topical research', 'Systemic use not established'],
    references: [
      { id: 'll37-1', title: 'LL-37: host defense peptide with immunomodulatory properties', authors: 'Overhage J et al.', year: 2008, journal: 'Cell Mol Life Sci', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'ara-290',
    name: 'ARA-290',
    aliases: ['Cibinetide', 'Helix B EPO-derived peptide'],
    isPeptide: true,
    classification: 'Erythropoietin-derived tissue-protective peptide (investigational)',
    categories: ['healing_recovery'],
    summary:
      'A tissue-protective peptide studied for neuropathy and inflammation with promising but limited clinical results.',
    proposedMechanism:
      'Activates innate repair receptor (IRR), a heteromer of EPO receptor and CD131, promoting anti-inflammatory and cytoprotective signaling without erythropoietic effects.',
    researchNotes:
      'ARA-290 (cibinetide) was studied in sarcoidosis-associated neuropathy and diabetic neuropathy with mixed phase 2 results. Researchers highlight non-hematopoietic EPO pathway activation. Human evidence is limited to specific neuropathy contexts; not FDA approved.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'investigational',
    researchAreas: ['Neuropathic pain', 'Sarcoidosis neuropathy', 'Tissue protection'],
    risks: ['Development setbacks in some indications', 'Limited generalizability'],
    uncertainties: ['Regulatory path forward', 'Efficacy in broader neuropathies'],
    knownAdverseEffects: ['Generally well tolerated in trials', 'Injection-site reactions'],
    references: [
      { id: 'ara-1', title: 'ARA 290 for sarcoidosis-associated neuropathy', authors: 'Dahan A et al.', year: 2013, journal: 'Mol Med', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'thymosin-alpha-1',
    name: 'Thymosin Alpha-1',
    aliases: ['Tα1', 'Thymalfasin', 'Zadaxin'],
    isPeptide: true,
    classification: 'Immunomodulatory peptide (approved in multiple countries)',
    categories: ['healing_recovery'],
    summary:
      'An immune-modulating peptide with approved use in several countries for viral and immune conditions; research ongoing.',
    proposedMechanism:
      'Enhances T-cell maturation and dendritic cell function; modulates TLR signaling and cytokine balance.',
    researchNotes:
      'Thymosin alpha-1 (thymalfasin) is approved outside the US for hepatitis B/C and as immune adjuvant in some regions. Studied during COVID-19 for immune modulation. Human evidence is moderate within approved indications. Not FDA approved in the United States.',
    humanEvidenceGrade: 'moderate_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'approved_outside_us',
    regulatoryDetail: 'Approved in multiple countries (e.g., Zadaxin); not FDA approved.',
    researchAreas: ['Immunomodulation', 'Hepatitis', 'Sepsis research', 'Vaccine adjuvant'],
    risks: ['Immune system perturbation', 'Indication-specific contraindications'],
    uncertainties: ['FDA approval pathway', 'Optimal use in emerging infections'],
    knownAdverseEffects: ['Injection-site reactions', 'Generally mild systemic effects in trials'],
    references: [
      { id: 'ta1-1', title: 'Thymosin alpha 1: from bench to bedside', authors: 'Dominari A et al.', year: 2020, journal: 'Ann NY Acad Sci', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'cjc-1295',
    name: 'CJC-1295',
    aliases: ['DAC:GRF', 'CJC-1295 without DAC'],
    isPeptide: true,
    classification: 'GHRH analog peptide (research-stage GH secretagogue)',
    categories: ['healing_recovery', 'gh_secretagogues'],
    summary:
      'A growth-hormone-releasing hormone analog studied for GH axis stimulation; human pharmacokinetic data exist but broad clinical evidence is limited.',
    proposedMechanism:
      'Binds GHRH receptors on pituitary somatotrophs, stimulating pulsatile or sustained GH release depending on DAC conjugation.',
    researchNotes:
      'CJC-1295 without DAC provides shorter GH pulses; CJC-1295 with DAC (separate entry) extends half-life via albumin binding. Human PK studies confirmed GH and IGF-1 elevation. WADA prohibits GHRH analogs. Not FDA approved for general use. Often combined with ghrelin mimetics in research discussions.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'not_fda_approved',
    researchAreas: ['GH axis research', 'Body composition', 'Recovery research'],
    risks: ['GH-axis related theoretical risks', 'WADA prohibited', 'Unregulated products'],
    uncertainties: ['Clinical benefit beyond GH elevation', 'Long-term safety'],
    knownAdverseEffects: ['Injection-site reactions', 'Headache', 'Flushing reported'],
    references: [
      { id: 'cjc-1', title: 'Prolonged stimulation of growth hormone by CJC-1295', authors: 'Teichman SL et al.', year: 2006, journal: 'J Clin Endocrinol Metab', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'ipamorelin',
    name: 'Ipamorelin',
    aliases: ['GHRP mimetic selective agonist'],
    isPeptide: true,
    classification: 'Selective ghrelin receptor (GHS-R) agonist peptide',
    categories: ['healing_recovery', 'gh_secretagogues'],
    summary:
      'A selective GH secretagogue peptide with relatively clean GH release profile in studied settings; limited outcome trials.',
    proposedMechanism:
      'Selective GHS-R1a agonism stimulating GH release with minimal effect on cortisol and prolactin compared to older GHRPs.',
    researchNotes:
      'Ipamorelin is among the most discussed selective GHRPs. Human studies confirm GH stimulation with favorable selectivity vs GHRP-6. Clinical outcome trials for body composition or recovery are sparse. WADA prohibited. Not FDA approved.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'not_fda_approved',
    researchAreas: ['GH axis research', 'Recovery', 'Sleep quality research'],
    risks: ['GH-axis perturbation', 'Unregulated product quality', 'WADA prohibited'],
    uncertainties: ['Meaningful clinical outcomes in humans', 'Long-term use effects'],
    knownAdverseEffects: ['Headache', 'Injection-site reactions', 'Mild water retention reported'],
    references: [
      { id: 'ipa-1', title: 'Ipamorelin, a selective growth hormone secretagogue', authors: 'Gobburu JVS et al.', year: 1999, journal: 'Eur J Endocrinol', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'peg-mgf',
    name: 'PEG-MGF',
    aliases: ['Pegylated Mechano Growth Factor'],
    isPeptide: true,
    classification: 'Pegylated IGF-1 splice variant peptide (research-stage)',
    categories: ['healing_recovery'],
    summary:
      'A pegylated muscle-repair peptide theorized to promote localized regeneration; human evidence is preclinical or anecdotal.',
    proposedMechanism:
      'IGF-1Ec splice variant (MGF) proposed to activate satellite cells and local muscle repair; pegylation extends half-life.',
    researchNotes:
      'Mechano growth factor is an IGF-1 splice variant upregulated after mechanical load. PEG-MGF is a research peptide without clinical trials. Preclinical muscle repair data exist. Human evidence remains insufficient. WADA prohibits IGF-1 related agents.',
    humanEvidenceGrade: 'preclinical_only',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'research_stage',
    researchAreas: ['Muscle repair', 'Satellite cell biology'],
    risks: ['Unproven human efficacy', 'IGF-1 pathway theoretical risks', 'WADA prohibited'],
    uncertainties: ['Local vs systemic effects in humans', 'Safety of IGF-1 pathway modulation'],
    knownAdverseEffects: ['Not systematically characterized in humans'],
    references: [
      { id: 'pegmgf-1', title: 'Mechano-growth factor: a local growth factor in skeletal muscle', authors: 'Hill M et al.', year: 2003, journal: 'J Physiol', evidenceType: 'animal' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'igf-1-lr3',
    name: 'IGF-1 LR3',
    aliases: ['Long R3 IGF-1', 'Insulin-like growth factor-1 LR3'],
    isPeptide: true,
    classification: 'Modified IGF-1 analog peptide (research-stage anabolic agent)',
    categories: ['healing_recovery'],
    summary:
      'A potent IGF-1 analog discussed for muscle and tissue anabolism with significant theoretical risk profile and no approved use.',
    proposedMechanism:
      'IGF-1 receptor activation with reduced IGF binding protein affinity and extended half-life, promoting cell proliferation and anabolism.',
    researchNotes:
      'IGF-1 LR3 is significantly more potent than endogenous IGF-1 in vitro. No approved human therapeutic use. WADA strictly prohibits. Researchers note theoretical risks including hypoglycemia, organomegaly, and mitogenic concerns. Human clinical evidence for safe use is absent.',
    humanEvidenceGrade: 'preclinical_only',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'not_fda_approved',
    regulatoryDetail: 'Prohibited in sport; not approved for any indication.',
    researchAreas: ['Muscle anabolism research', 'Tissue repair research'],
    risks: ['Hypoglycemia', 'Mitogenic/cancer theoretical concerns', 'Organ growth', 'WADA prohibited'],
    uncertainties: ['Any safe human research context outside controlled trials'],
    knownAdverseEffects: ['Hypoglycemia in animal models', 'Human AE profile unknown'],
    references: [
      { id: 'igf1-1', title: 'IGF-1 and analogs in muscle biology', authors: 'Adams GR', year: 2010, journal: 'Pediatr Nephrol', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'cartalax',
    name: 'Cartalax',
    aliases: ['Cartilage peptide bioregulator'],
    isPeptide: true,
    classification: 'Short peptide bioregulator (research-stage joint support)',
    categories: ['healing_recovery'],
    summary:
      'A cartilage-targeted peptide bioregulator promoted for joint support with very limited Western peer-reviewed evidence.',
    proposedMechanism:
      'Proposed normalization of cartilage cell gene expression via Khavinson bioregulator framework; anti-inflammatory and matrix support theorized.',
    researchNotes:
      'Cartalax originates from Russian peptide bioregulator research (Khavinson). Western peer-reviewed clinical evidence is sparse. Often marketed for cartilage repair and joint inflammation. Human evidence remains limited or region-specific. Researchers should treat claims cautiously pending independent replication.',
    humanEvidenceGrade: 'insufficient',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'research_stage',
    researchAreas: ['Cartilage biology', 'Joint research', 'Bioregulator peptides'],
    risks: ['Limited independent validation', 'Unregulated products'],
    uncertainties: ['Efficacy in osteoarthritis or injury', 'Mechanism in humans'],
    knownAdverseEffects: ['Insufficient systematic data'],
    references: [
      { id: 'cart-1', title: 'Peptide bioregulators and cartilage research overview', authors: 'Khavinson VK et al.', year: 2014, journal: 'Bull Exp Biol Med', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },

  // ─── Cosmetic / Skin ──────────────────────────────────────────────────────
  {
    id: 'melanotan-i',
    name: 'Melanotan I',
    aliases: ['Afamelanotide', 'Scenesse'],
    isPeptide: true,
    classification: 'Alpha-MSH analog peptide (FDA/EMA approved for EPP in specific form)',
    categories: ['cosmetic_skin'],
    summary:
      'An FDA/EMA-approved melanocortin peptide for erythropoietic protoporphyria phototoxicity; also studied for tanning effects.',
    proposedMechanism:
      'MC1R agonism increases eumelanin production in melanocytes, providing photoprotection and skin darkening.',
    researchNotes:
      'Afamelanotide (Scenesse implant) is approved in the US and EU for EPP to increase pain-free sunlight exposure. Tanning effects occur as a secondary outcome. Distinct from Melanotan II with more selective MC1R profile. Human evidence is strong within EPP indication.',
    humanEvidenceGrade: 'strong_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'fda_approved_specific',
    regulatoryDetail: 'FDA approved (Scenesse) for erythropoietic protoporphyria.',
    researchAreas: ['Photoprotection', 'EPP', 'Melanogenesis'],
    risks: ['Nausea', 'Facial flushing', 'Darkening of moles/freckles', 'Off-label tanning use unapproved'],
    uncertainties: ['Long-term melanoma surveillance data', 'Cosmetic tanning use safety'],
    knownAdverseEffects: ['Nausea', 'Headache', 'Facial flushing', 'Injection-site reactions'],
    references: [
      { id: 'mt1-1', title: 'Afamelanotide for erythropoietic protoporphyria (CUV039 trial)', authors: 'Langendonk JG et al.', year: 2015, journal: 'NEJM', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'melanotan-ii',
    name: 'Melanotan II',
    aliases: ['MT-II', 'Melanotan 2'],
    isPeptide: true,
    classification: 'Non-selective melanocortin receptor agonist peptide (unapproved)',
    categories: ['cosmetic_skin', 'sexual_health'],
    summary:
      'A melanocortin peptide producing skin darkening and sometimes libido effects; not approved and associated with significant side effects.',
    proposedMechanism:
      'Agonizes MC1R (tanning), MC3R/MC4R (appetite, sexual function), causing melanogenesis and central melanocortin effects.',
    researchNotes:
      'Melanotan II is not FDA approved. FDA has warned against use due to side effects including nausea, blood pressure changes, and mole darkening. Some clinical research explored sexual function (overlap with PT-141 pathway). Sold in unregulated markets. Human evidence for safe cosmetic use is insufficient.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'not_fda_approved',
    regulatoryDetail: 'Not FDA approved; FDA consumer warnings issued.',
    researchAreas: ['Melanogenesis', 'Sexual function research', 'Appetite modulation'],
    risks: ['Nausea', 'Hypertension', 'Mole changes', 'Unknown long-term melanoma risk', 'Unregulated products'],
    uncertainties: ['Safe long-term tanning use', 'Melanoma surveillance needs'],
    knownAdverseEffects: ['Nausea', 'Flushing', 'Yawning', 'Stretching', 'Spontaneous erections', 'Mole darkening'],
    references: [
      { id: 'mt2-1', title: 'Melanotan II pharmacology and safety concerns', authors: 'FDA Consumer Update', year: 2021, evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'pt-141',
    name: 'PT-141',
    aliases: ['Bremelanotide', 'Vyleesi'],
    isPeptide: true,
    classification: 'Melanocortin receptor agonist peptide (FDA-approved for HSDD)',
    categories: ['cosmetic_skin', 'sexual_health'],
    summary:
      'An FDA-approved melanocortin peptide for hypoactive sexual desire disorder in premenopausal women; studied for arousal effects.',
    proposedMechanism:
      'MC3R/MC4R agonism in central nervous system modulates sexual desire and arousal pathways independent of vascular mechanisms.',
    researchNotes:
      'Bremelanotide (Vyleesi) is FDA approved for acquired HSDD in premenopausal women. RECLAIM trials demonstrated improved desire and distress measures. Unlike PDE5 inhibitors, acts centrally. Human evidence is moderate within approved population. Off-label discussion for other populations lacks equivalent evidence.',
    humanEvidenceGrade: 'moderate_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'fda_approved_specific',
    regulatoryDetail: 'FDA approved (Vyleesi) for hypoactive sexual desire disorder in premenopausal women.',
    researchAreas: ['Sexual desire disorder', 'Melanocortin neuroscience'],
    risks: ['Nausea (common)', 'Hyperpigmentation with repeated use', 'Blood pressure increases transiently', 'Not for use with cardiovascular contraindications per label'],
    uncertainties: ['Efficacy in men or other populations', 'Long-term hyperpigmentation management'],
    knownAdverseEffects: ['Nausea', 'Flushing', 'Headache', 'Injection-site reactions', 'Hyperpigmentation'],
    references: [
      { id: 'pt141-1', title: 'Bremelanotide for hypoactive sexual desire disorder (RECLAIM trials)', authors: 'Simon JA et al.', year: 2019, journal: 'Obstet Gynecol', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'epitalon',
    name: 'Epitalon',
    aliases: ['Epithalon', 'AEDG peptide', 'Epithalamin synthetic analog'],
    isPeptide: true,
    classification: 'Synthetic tetrapeptide bioregulator (aging research)',
    categories: ['cosmetic_skin', 'sleep_circadian'],
    summary:
      'A tetrapeptide studied for telomerase and circadian effects in limited research; human evidence remains sparse and contested.',
    proposedMechanism:
      'Proposed telomerase activation via hTERT upregulation and pineal gland/pineal peptide signaling affecting melatonin and circadian rhythms.',
    researchNotes:
      'Epitalon derives from Khavinson bioregulator research. Russian studies reported telomere lengthening and lifespan effects; independent Western replication is limited. Researchers debate methodological quality. Human evidence remains limited. Often marketed for anti-aging without robust clinical validation.',
    humanEvidenceGrade: 'insufficient',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'research_stage',
    researchAreas: ['Aging research', 'Telomere biology', 'Circadian/pineal research'],
    risks: ['Unproven anti-aging claims', 'Telomerase and cancer theoretical concerns', 'Unregulated products'],
    uncertainties: ['Telomere effects in independent trials', 'Safety of telomerase modulation'],
    knownAdverseEffects: ['Insufficient systematic human data'],
    references: [
      { id: 'epi-1', title: 'Peptide Epitalon and telomere maintenance research', authors: 'Khavinson VK et al.', year: 2003, journal: 'Bull Exp Biol Med', evidenceType: 'animal' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'matrixyl',
    name: 'Matrixyl',
    aliases: ['Palmitoyl Pentapeptide-4', 'Pal-KTTKS'],
    isPeptide: true,
    classification: 'Cosmetic signal peptide (topical collagen stimulator)',
    categories: ['cosmetic_skin'],
    summary:
      'A widely used cosmetic peptide that available evidence suggests may support collagen production and reduce wrinkle appearance topically.',
    proposedMechanism:
      'Pro-collagen I fragment mimic; stimulates collagen I, III, and fibronectin synthesis in fibroblasts.',
    researchNotes:
      'Matrixyl (palmitoyl pentapeptide-4) is among the best-studied cosmetic peptides. In vitro and small clinical studies show wrinkle reduction over weeks of topical use. Human evidence is moderate for cosmetic endpoints, not pharmaceutical claims. Standard in anti-aging skincare formulations.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'not_fda_approved',
    regulatoryDetail: 'Cosmetic ingredient; not FDA approved as drug.',
    researchAreas: ['Skin aging', 'Collagen synthesis', 'Cosmetic dermatology'],
    risks: ['Cosmetic-only evidence', 'Individual response variability', 'Formulation dependent'],
    uncertainties: ['Magnitude of effect vs retinoids', 'Long-term collagen histology in humans'],
    knownAdverseEffects: ['Generally well tolerated topically', 'Mild irritation possible'],
    references: [
      { id: 'matrix-1', title: 'Pal-KTTKS and collagen stimulation in skin', authors: 'Robinson LR et al.', year: 2005, journal: 'Int J Cosmet Sci', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'argireline',
    name: 'Argireline',
    aliases: ['Acetyl Hexapeptide-8', 'Acetyl Hexapeptide-3'],
    isPeptide: true,
    classification: 'Cosmetic neurotransmitter-inhibiting peptide (topical)',
    categories: ['cosmetic_skin'],
    summary:
      'A topical peptide marketed to soften expression wrinkles by modulating SNARE complex-mediated muscle contraction.',
    proposedMechanism:
      'Competitive inhibition of SNARE complex formation, reducing acetylcholine vesicle fusion and attenuating superficial muscle contraction (botox-like mechanism at cosmetic level).',
    researchNotes:
      'Argireline is widely used in "botox-like" serums. In vitro and small clinical studies report wrinkle depth reduction. Effects are modest compared to neuromodulator injections. Human evidence is limited to cosmetic trials. Topical only in legitimate research contexts.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'not_fda_approved',
    regulatoryDetail: 'Cosmetic ingredient.',
    researchAreas: ['Expression wrinkles', 'Cosmetic neuromodulation'],
    risks: ['Modest efficacy expectations', 'Marketing overstatement'],
    uncertainties: ['Comparison with established wrinkle treatments'],
    knownAdverseEffects: ['Topical irritation rare'],
    references: [
      { id: 'argi-1', title: 'Acetyl hexapeptide-3 in anti-wrinkle formulations', authors: 'Blanes-Mira C et al.', year: 2002, journal: 'Int J Cosmet Sci', evidenceType: 'in_vitro' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'snap-8',
    name: 'Snap-8',
    aliases: ['Acetyl Glutamyl Heptapeptide-3', 'Acetyl Octapeptide-3'],
    isPeptide: true,
    classification: 'Cosmetic octapeptide (Argireline analog)',
    categories: ['cosmetic_skin'],
    summary:
      'An extended cosmetic peptide similar to Argireline, designed for expression wrinkle reduction with limited clinical data.',
    proposedMechanism:
      'SNARE complex modulation reducing neurotransmitter release at motor endplates, attenuating dynamic wrinkles.',
    researchNotes:
      'Snap-8 is marketed as a more potent Argireline analog. Evidence base is primarily in vitro and small manufacturer-sponsored cosmetic studies. Human evidence remains limited. Used in topical anti-aging products.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'not_fda_approved',
    regulatoryDetail: 'Cosmetic ingredient.',
    researchAreas: ['Expression wrinkles', 'Cosmetic peptides'],
    risks: ['Limited independent clinical trials', 'Modest expected effects'],
    uncertainties: ['Superiority over pentapeptide-4 or hexapeptide-8'],
    knownAdverseEffects: ['Topical tolerance generally good'],
    references: [
      { id: 'snap-1', title: 'Octapeptide SNARE modulators in cosmetic research', authors: 'Manufacturer research summaries', year: 2010, evidenceType: 'in_vitro' },
    ],
    lastReviewedAt: REV,
  },

  // ─── Sexual Health ────────────────────────────────────────────────────────
  {
    id: 'kisspeptin-10',
    name: 'Kisspeptin-10',
    aliases: ['KP-10', 'Metastin 10'],
    isPeptide: true,
    classification: 'Hypothalamic reproductive signaling peptide (research tool and investigational)',
    categories: ['sexual_health'],
    summary:
      'A reproductive neuropeptide that stimulates GnRH and gonadotropin release; studied for fertility and hypogonadism research.',
    proposedMechanism:
      'Activates KISS1R (GPR54) on GnRH neurons, triggering LH/FSH release and downstream sex steroid production.',
    researchNotes:
      'Kisspeptin-10 is the critical upstream regulator of puberty and reproduction. Human studies demonstrate robust LH pulses in healthy men and women. Researchers study it for hypogonadotropic hypogonadism, IVF triggers, and sexual function. Human evidence is moderate for physiological endpoints; therapeutic products limited.',
    humanEvidenceGrade: 'moderate_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'investigational',
    researchAreas: ['Hypogonadism', 'Fertility research', 'Puberty disorders', 'Reproductive endocrinology'],
    risks: ['Hormonal perturbation', 'Research-stage only for most uses'],
    uncertainties: ['Therapeutic product development', 'Chronic use effects'],
    knownAdverseEffects: ['Generally well tolerated in short studies', 'Mild nausea reported'],
    references: [
      { id: 'kiss10-1', title: 'Kisspeptin-10 stimulates gonadotropin release in men', authors: 'Dhillo WS et al.', year: 2005, journal: 'J Clin Endocrinol Metab', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'kisspeptin-54',
    name: 'Kisspeptin-54',
    aliases: ['KP-54', 'Metastin', 'Full-length kisspeptin'],
    isPeptide: true,
    classification: 'Full-length kisspeptin neuropeptide (research/investigational)',
    categories: ['sexual_health'],
    summary:
      'The full-length kisspeptin form with longer duration of gonadotropin stimulation compared to KP-10 in studied settings.',
    proposedMechanism:
      'KISS1R activation with prolonged GnRH/LH signaling due to extended peptide structure and slower clearance.',
    researchNotes:
      'Kisspeptin-54 (metastin) was originally identified as a metastasis suppressor before reproductive roles were discovered. Human infusion studies show sustained LH elevation. Investigated for IVF oocyte maturation triggers. Human evidence is moderate for endocrine endpoints.',
    humanEvidenceGrade: 'moderate_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'investigational',
    researchAreas: ['IVF', 'Hypogonadotropic hypogonadism', 'Reproductive endocrinology'],
    risks: ['Hormonal overshoot in sensitive populations', 'Limited approved products'],
    uncertainties: ['Clinical adoption vs GnRH analogs', 'Optimal clinical protocols in research settings'],
    knownAdverseEffects: ['Mild GI effects in some studies'],
    references: [
      { id: 'kiss54-1', title: 'Kisspeptin-54 triggers LH surges in women', authors: 'Dhillo WS et al.', year: 2007, journal: 'J Clin Endocrinol Metab', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'oxytocin',
    name: 'Oxytocin',
    aliases: ['OT', 'Love hormone'],
    isPeptide: true,
    classification: 'Neurohypophysial peptide hormone (FDA-approved for labor; research for social/cognitive effects)',
    categories: ['sexual_health', 'cognitive_neuropeptide'],
    summary:
      'A bonding and social-signaling peptide with approved obstetric use; intranasal social and sexual effects show mixed research results.',
    proposedMechanism:
      'Oxytocin receptor activation in brain and periphery modulates social cognition, trust, stress response, and smooth muscle contraction.',
    researchNotes:
      'Oxytocin is FDA-approved (Pitocin) for labor induction. Intranasal oxytocin has been extensively studied for autism, social anxiety, and pair bonding with mixed replication. Nasal route is most studied for central effects but bioavailability and brain delivery remain debated. Sexual and intimacy research shows inconsistent findings.',
    humanEvidenceGrade: 'moderate_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'fda_approved_specific',
    regulatoryDetail: 'FDA approved for labor induction; intranasal social use is investigational.',
    researchAreas: ['Social cognition', 'Autism research', 'Pair bonding', 'Sexual function research'],
    risks: ['Replication crisis in social neuroscience', 'Hyponatremia with high doses IV', 'Nasal route variability'],
    uncertainties: ['Reliable intranasal CNS delivery', 'Clinical utility for social disorders'],
    knownAdverseEffects: ['Headache', 'Nasal irritation (intranasal)', 'Uterine contractions (systemic)'],
    references: [
      { id: 'oxy-1', title: 'Intranasal oxytocin in social cognition: systematic review', authors: 'Shahrestani S et al.', year: 2013, journal: 'Psychoneuroendocrinology', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'hcg',
    name: 'HCG',
    aliases: ['Human chorionic gonadotropin', 'Pregnyl', 'Novarel'],
    isPeptide: true,
    classification: 'Glycoprotein hormone (FDA-approved for specific fertility and hypogonadism indications)',
    categories: ['sexual_health'],
    summary:
      'A gonadotropin hormone approved for fertility and select hypogonadism protocols; stimulates testosterone and spermatogenesis.',
    proposedMechanism:
      'Activates LH/CG receptors on Leydig cells (testosterone) and supports FSH-mediated spermatogenesis in combination protocols.',
    researchNotes:
      'HCG is FDA-approved for cryptorchidism, hypogonadotropic hypogonadism, and fertility protocols. Used in male hypogonadism to preserve testicular function alongside TRT in some protocols. Human evidence is strong within approved uses. Misuse for weight loss (HCG diet) is not supported by evidence.',
    humanEvidenceGrade: 'strong_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'fda_approved_specific',
    regulatoryDetail: 'FDA approved for specific fertility and hypogonadism indications.',
    researchAreas: ['Male hypogonadism', 'Fertility', 'Cryptorchidism'],
    risks: ['Gynecomastia', 'Erythrocytosis with testosterone rise', 'Ovarian hyperstimulation in women'],
    uncertainties: ['Optimal protocols for male fertility preservation on TRT'],
    knownAdverseEffects: ['Injection-site pain', 'Headache', 'Mood changes', 'Acne'],
    references: [
      { id: 'hcg-1', title: 'HCG in male hypogonadism and fertility preservation', authors: 'Wenker EP et al.', year: 2015, journal: 'Asian J Androl', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'gonadorelin',
    name: 'Gonadorelin',
    aliases: ['GnRH', 'LHRH', 'Factrel'],
    isPeptide: true,
    classification: 'Gonadotropin-releasing hormone peptide (diagnostic and fertility use)',
    categories: ['sexual_health', 'gh_secretagogues'],
    summary:
      'The native GnRH decapeptide used diagnostically and therapeutically to stimulate LH/FSH for fertility and hormonal assessment.',
    proposedMechanism:
      'Pulsatile GnRH receptor activation on pituitary gonadotrophs stimulates LH and FSH release.',
    researchNotes:
      'Gonadorelin (native GnRH) differs from long-acting GnRH agonists that cause downregulation. Used in fertility and diagnostic testing. Human evidence is established for approved uses. Also discussed in male fertility and hormonal research contexts (educational only).',
    humanEvidenceGrade: 'strong_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'fda_approved_specific',
    regulatoryDetail: 'FDA approved for diagnostic and fertility-related uses.',
    researchAreas: ['Fertility', 'Delayed puberty', 'Diagnostic endocrinology'],
    risks: ['Hormonal fluctuations', 'Ovarian hyperstimulation in fertility protocols'],
    uncertainties: ['Pulsatile delivery optimization in research models'],
    knownAdverseEffects: ['Headache', 'Abdominal discomfort', 'Injection-site reactions'],
    references: [
      { id: 'gnrh-1', title: 'GnRH and its analogs in reproductive medicine', authors: 'Conn PM', year: 1994, journal: 'Physiol Rev', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'tadalafil',
    name: 'Tadalafil',
    aliases: ['Cialis', 'PDE5 inhibitor'],
    isPeptide: false,
    classification: 'Non-peptide PDE5 inhibitor (FDA-approved for ED and other indications)',
    categories: ['sexual_health'],
    summary:
      'A long-acting PDE5 inhibitor with strong evidence for erectile dysfunction; not a peptide but commonly discussed alongside sexual health agents.',
    proposedMechanism:
      'Inhibits phosphodiesterase-5, prolonging cGMP signaling and smooth muscle relaxation in penile vasculature.',
    researchNotes:
      'Tadalafil is FDA approved for erectile dysfunction, benign prostatic hyperplasia, and pulmonary hypertension. Human evidence is strong for ED. Also studied for cardiovascular and metabolic endpoints. Classified as non-peptide small molecule. Distinct mechanism from melanocortin peptides like PT-141.',
    humanEvidenceGrade: 'strong_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'fda_approved_specific',
    regulatoryDetail: 'FDA approved for ED, BPH, and pulmonary arterial hypertension.',
    researchAreas: ['Erectile dysfunction', 'Pulmonary hypertension', 'BPH'],
    risks: ['Hypotension with nitrates (contraindicated)', 'Headache', 'Back pain', 'Visual changes rare'],
    uncertainties: ['Long-term cardiovascular outcomes in ED populations'],
    knownAdverseEffects: ['Headache', 'Dyspepsia', 'Back pain', 'Myalgia', 'Flushing'],
    references: [
      { id: 'tada-1', title: 'Tadalafil for erectile dysfunction clinical review', authors: 'Carson CC et al.', year: 2004, journal: 'BJU Int', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'aminotadalafil',
    name: 'Aminotadalafil',
    aliases: ['Tadalafil analog'],
    isPeptide: false,
    classification: 'Non-peptide PDE5 inhibitor analog (unapproved research compound)',
    categories: ['sexual_health'],
    summary:
      'A tadalafil analog found in unregulated supplements; human safety and efficacy data are substantially less than approved PDE5 inhibitors.',
    proposedMechanism:
      'PDE5 inhibition similar to tadalafil, proposed to enhance cGMP-mediated vasodilation.',
    researchNotes:
      'Aminotadalafil has appeared as an adulterant in "natural" sexual enhancement products. FDA has issued warnings. Human clinical trial data are minimal compared to tadalafil. Not approved for any indication. Not a peptide.',
    humanEvidenceGrade: 'insufficient',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'not_fda_approved',
    researchAreas: ['PDE5 pharmacology', 'Adulterant detection'],
    risks: ['Unknown purity and dose in products', 'Drug interactions', 'Counterfeit supplement context'],
    uncertainties: ['Any legitimate therapeutic development path'],
    knownAdverseEffects: ['Expected PDE5 class effects but poorly characterized'],
    references: [
      { id: 'aminot-1', title: 'FDA warnings on hidden drug ingredients in supplements', authors: 'FDA', year: 2020, evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'hmg',
    name: 'HMG',
    aliases: ['Human menopausal gonadotropin', 'Menotropins'],
    isPeptide: true,
    classification: 'Gonadotropin hormone preparation (FDA-approved for fertility)',
    categories: ['sexual_health'],
    summary:
      'A fertility hormone preparation containing FSH and LH activity, used to stimulate egg and sperm production in assisted reproduction.',
    proposedMechanism:
      'Exogenous FSH/LH activity stimulates ovarian follicular development in women and spermatogenesis support in men.',
    researchNotes:
      'HMG (menotropins) is FDA approved for fertility treatment. Standard in IVF ovarian stimulation protocols. Human evidence is strong within reproductive medicine. Not related to peptide research markets but included as hormone peptide discussed in sexual health/fertility contexts.',
    humanEvidenceGrade: 'strong_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'fda_approved_specific',
    regulatoryDetail: 'FDA approved for infertility treatment.',
    researchAreas: ['IVF', 'Ovulation induction', 'Male fertility'],
    risks: ['Ovarian hyperstimulation syndrome', 'Multiple pregnancy', 'Injection-site reactions'],
    uncertainties: ['Protocol optimization in poor responders'],
    knownAdverseEffects: ['Abdominal bloating', 'Ovarian enlargement', 'Headache'],
    references: [
      { id: 'hmg-1', title: 'Menotropins in assisted reproductive technology', authors: 'Practice Committee ASRM', year: 2016, journal: 'Fertil Steril', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },

  // ─── Hair Research ────────────────────────────────────────────────────────
  {
    id: 'ptd-dbm',
    name: 'PTD-DBM',
    aliases: ['Wnt pathway peptide', 'CXXC5 inhibitor peptide'],
    isPeptide: true,
    classification: 'Wnt pathway modulating peptide (hair research)',
    categories: ['hair_research'],
    summary:
      'A peptide studied preclinically to reactivate hair follicle Wnt signaling; human clinical evidence is absent.',
    proposedMechanism:
      'Disrupts CXXC5 interaction with Dishevelled, releasing Wnt/β-catenin signaling in follicle stem cells to promote anagen.',
    researchNotes:
      'PTD-DBM showed hair regrowth in mouse models by activating Wnt pathways. Developed by Korean researchers. Human trials are limited or unpublished. Represents investigational hair biology research. Not FDA approved.',
    humanEvidenceGrade: 'preclinical_only',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'research_stage',
    researchAreas: ['Androgenetic alopecia', 'Wnt signaling', 'Follicle stem cells'],
    risks: ['No human safety data', 'Unregulated research products'],
    uncertainties: ['Translation to human hair loss', 'Combination with existing therapies'],
    knownAdverseEffects: ['Not established in humans'],
    references: [
      { id: 'ptd-1', title: 'CXXC5 peptide therapy for hair regrowth via Wnt activation', authors: 'Lee SH et al.', year: 2017, journal: 'J Invest Dermatol', evidenceType: 'animal' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'ru58841',
    name: 'RU58841',
    aliases: ['RU-58841', 'Topical anti-androgen'],
    isPeptide: false,
    classification: 'Non-peptide topical androgen receptor antagonist (research compound)',
    categories: ['hair_research'],
    summary:
      'A topical anti-androgen studied preclinically for scalp DHT blockade; never approved and human trial data are limited.',
    proposedMechanism:
      'Competitive androgen receptor antagonism at scalp follicles without systemic anti-androgen effects in theory.',
    researchNotes:
      'RU58841 showed hair growth in macaque models. Human data are limited to small studies and community reports. Development was discontinued commercially. Not FDA approved. Not a peptide. Often compared to finasteride but with less human evidence.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'research_stage',
    researchAreas: ['Androgenetic alopecia', 'Topical anti-androgens'],
    risks: ['Unknown systemic absorption effects', 'Unregulated product purity', 'Endocrine disruption theoretical risk'],
    uncertainties: ['Efficacy vs finasteride/minoxidil', 'Long-term scalp safety'],
    knownAdverseEffects: ['Scalp irritation reported anecdotally', 'Systematic AE data lacking'],
    references: [
      { id: 'ru-1', title: 'RU58841 androgen receptor blocker hair growth in macaques', authors: 'Battmann T et al.', year: 1994, journal: 'Br J Dermatol', evidenceType: 'animal' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'kx-826',
    name: 'KX-826',
    aliases: ['Pyrilutamide', 'Topical androgen receptor antagonist'],
    isPeptide: false,
    classification: 'Non-peptide topical androgen receptor antagonist (investigational)',
    categories: ['hair_research'],
    summary:
      'A topical DHT-blocking compound in clinical development for androgenetic alopecia with phase 2 data in China.',
    proposedMechanism:
      'Local androgen receptor antagonism at hair follicles to reduce DHT-driven miniaturization with minimal systemic exposure.',
    researchNotes:
      'KX-826 (pyrilutamide) reported positive phase 2 results for male and female pattern hair loss in Chinese trials. Represents newer topical anti-androgen approach. Human evidence is limited and region-specific; not FDA approved globally.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'investigational',
    researchAreas: ['Androgenetic alopecia', 'Topical anti-androgens'],
    risks: ['Limited global trial data', 'Long-term follicle effects unknown'],
    uncertainties: ['FDA/global regulatory path', 'Comparison with oral 5-AR inhibitors'],
    knownAdverseEffects: ['Scalp irritation in trials', 'Generally local tolerability acceptable'],
    references: [
      { id: 'kx-1', title: 'Pyrilutamide (KX-826) phase 2 trial in AGA', authors: 'Chinese trial investigators', year: 2022, journal: 'Conference/JID', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'cb-03-01',
    name: 'CB-03-01',
    aliases: ['Cortexolone 17α-propionate', 'Clascoterone topical'],
    isPeptide: false,
    classification: 'Non-peptide topical androgen receptor inhibitor (FDA-approved for acne; hair research overlap)',
    categories: ['hair_research'],
    summary:
      'A topical anti-androgen approved for acne with research interest for androgenetic alopecia; not a peptide.',
    proposedMechanism:
      'Competes with DHT for androgen receptor binding locally in skin/follicle tissue.',
    researchNotes:
      'Clascoterone (Winlevi) is FDA approved for acne. Hair loss applications are investigational with early clinical interest. Provides locally acting anti-androgen mechanism relevant to hair research discussions.',
    humanEvidenceGrade: 'moderate_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'fda_approved_specific',
    regulatoryDetail: 'FDA approved for acne (Winlevi); hair loss indication investigational.',
    researchAreas: ['Acne', 'Androgenetic alopecia research'],
    risks: ['Local irritation', 'Hormonal effects if systemic absorption significant'],
    uncertainties: ['Hair regrowth efficacy vs dedicated AGA therapies'],
    knownAdverseEffects: ['Local skin reactions', 'Dryness'],
    references: [
      { id: 'cb-1', title: 'Clascoterone for acne vulgaris phase 3 trials', authors: 'Hebert A et al.', year: 2020, journal: 'JAMA Dermatol', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'topilutamide',
    name: 'Topilutamide',
    aliases: ['Fluridil topical', 'Topical anti-androgen'],
    isPeptide: false,
    classification: 'Non-peptide topical anti-androgen (research compound)',
    categories: ['hair_research'],
    summary:
      'A topical androgen blocker discussed for pattern hair loss with limited published human trial evidence.',
    proposedMechanism:
      'Local androgen receptor modulation at scalp follicles to reduce DHT-driven miniaturization.',
    researchNotes:
      'Topilutamide (fluridil) has European research history for androgenetic alopecia. Human evidence remains limited compared to minoxidil and finasteride. Not FDA approved. Not a peptide.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'research_stage',
    researchAreas: ['Androgenetic alopecia', 'Topical anti-androgens'],
    risks: ['Limited modern trial data', 'Product availability inconsistent'],
    uncertainties: ['Contemporary efficacy vs standard therapies'],
    knownAdverseEffects: ['Scalp irritation possible'],
    references: [
      { id: 'topi-1', title: 'Fluridil topical anti-androgen for AGA', authors: 'European dermatology investigators', year: 2002, journal: 'Dermatology', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },

  // ─── GH Secretagogues ─────────────────────────────────────────────────────
  {
    id: 'sermorelin',
    name: 'Sermorelin',
    aliases: ['GHRH 1-29', 'Geref'],
    isPeptide: true,
    classification: 'GHRH analog peptide (previously FDA-approved; discontinued)',
    categories: ['gh_secretagogues'],
    summary:
      'A short GHRH analog that stimulates endogenous GH release; previously FDA-approved but discontinued commercially.',
    proposedMechanism:
      'Binds GHRH receptors on pituitary to stimulate pulsatile growth hormone secretion.',
    researchNotes:
      'Sermorelin (Geref) was FDA approved for pediatric GH deficiency diagnosis but discontinued for commercial reasons, not necessarily safety. Still compounded and studied in adult GH insufficiency research. Human evidence exists for GH stimulation. WADA prohibited.',
    humanEvidenceGrade: 'moderate_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'withdrawn',
    regulatoryDetail: 'Previously FDA approved; discontinued. Compounded in limited contexts.',
    researchAreas: ['GH deficiency', 'Anti-aging research', 'Body composition'],
    risks: ['GH-axis effects', 'Compounding quality variability', 'WADA prohibited'],
    uncertainties: ['Clinical role vs rhGH and newer secretagogues'],
    knownAdverseEffects: ['Injection-site reactions', 'Flushing', 'Headache', 'Dizziness'],
    references: [
      { id: 'serm-1', title: 'Sermorelin acetate in GH deficiency', authors: 'Walker RF', year: 2006, journal: 'Clin Interv Aging', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'cjc-1295-dac',
    name: 'CJC-1295 with DAC',
    aliases: ['DAC:GRF', 'Drug affinity complex CJC-1295'],
    isPeptide: true,
    classification: 'Long-acting GHRH analog peptide with DAC modification',
    categories: ['gh_secretagogues'],
    summary:
      'A DAC-conjugated GHRH analog providing extended GH elevation; studied in human PK trials but not FDA approved.',
    proposedMechanism:
      'Albumin binding via DAC extends half-life, producing sustained GHRH receptor activation and elevated IGF-1.',
    researchNotes:
      'CJC-1295 DAC demonstrated multi-day GH elevation in healthy volunteers (Teichman 2006). Popular in research/peptide communities despite lack of approval. Concerns about non-pulsatile GH exposure. WADA prohibited.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'not_fda_approved',
    researchAreas: ['GH axis', 'Long-acting secretagogues'],
    risks: ['Continuous GH exposure theoretical concerns', 'WADA prohibited', 'Unregulated products'],
    uncertainties: ['Safety of sustained GH elevation vs pulsatile physiology'],
    knownAdverseEffects: ['Injection-site reactions', 'Headache', 'Water retention reported'],
    references: [
      { id: 'cjcdac-1', title: 'Prolonged stimulation of GH by CJC-1295 with DAC', authors: 'Teichman SL et al.', year: 2006, journal: 'J Clin Endocrinol Metab', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'mod-grf-1-29',
    name: 'Mod GRF 1-29',
    aliases: ['Modified GRF 1-29', 'CJC-1295 without DAC', 'Tesamorelin analog fragment'],
    isPeptide: true,
    classification: 'Short-acting modified GHRH analog peptide',
    categories: ['gh_secretagogues'],
    summary:
      'A short-acting GHRH analog designed for pulsatile GH release without DAC extension; research-stage only.',
    proposedMechanism:
      'GHRH receptor agonism with D-amino acid modifications for stability while preserving short pulse kinetics.',
    researchNotes:
      'Mod GRF 1-29 is essentially CJC-1295 without DAC, intended to mimic natural pulsatile GH secretion when combined with GHRPs. Human PK data are more limited than DAC version. Not FDA approved. WADA prohibited.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'not_fda_approved',
    researchAreas: ['Pulsatile GH research', 'Secretagogue combinations'],
    risks: ['Unregulated products', 'WADA prohibited', 'Limited outcome trials'],
    uncertainties: ['Advantage over other GHRH analogs clinically'],
    knownAdverseEffects: ['Injection-site reactions', 'Flushing'],
    references: [
      { id: 'modgrf-1', title: 'GHRH analog pharmacokinetics review', authors: 'Teichman SL et al.', year: 2006, journal: 'J Clin Endocrinol Metab', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'ghrp-2',
    name: 'GHRP-2',
    aliases: ['Pralmorelin', 'KP-102'],
    isPeptide: true,
    classification: 'Growth hormone releasing peptide (GHS-R agonist)',
    categories: ['gh_secretagogues'],
    summary:
      'A potent GH secretagogue peptide with strong GH release in human studies; approved as diagnostic in some countries.',
    proposedMechanism:
      'GHS-R1a agonism stimulates GH release; also stimulates cortisol and prolactin to a greater degree than ipamorelin.',
    researchNotes:
      'GHRP-2 (pralmorelin) is approved in Japan as a diagnostic test for GH deficiency. Potent GH release documented in humans. Also increases appetite via ghrelin pathway. WADA prohibited. Not FDA approved therapeutically.',
    humanEvidenceGrade: 'moderate_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'approved_outside_us',
    regulatoryDetail: 'Diagnostic use in Japan; not FDA approved therapeutically.',
    researchAreas: ['GH deficiency diagnosis', 'GH axis research'],
    risks: ['Cortisol/prolactin elevation', 'Appetite increase', 'WADA prohibited'],
    uncertainties: ['Therapeutic development outside diagnostics'],
    knownAdverseEffects: ['Hunger', 'Cortisol rise', 'Injection-site reactions'],
    references: [
      { id: 'ghrp2-1', title: 'GHRP-2 stimulates GH release in humans', authors: 'Bowers CY et al.', year: 1990, journal: 'J Clin Endocrinol Metab', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'ghrp-6',
    name: 'GHRP-6',
    aliases: ['Growth hormone releasing hexapeptide'],
    isPeptide: true,
    classification: 'Growth hormone releasing peptide (GHS-R agonist)',
    categories: ['gh_secretagogues'],
    summary:
      'An early GH secretagogue peptide notable for strong GH release and significant appetite stimulation.',
    proposedMechanism:
      'GHS-R agonism with pronounced ghrelin-mimetic appetite effects via hypothalamic feeding circuits.',
    researchNotes:
      'GHRP-6 was among the first synthetic GHRPs characterized. Robust GH release in humans but significant hunger side effect limits therapeutic interest. Extensively used as research tool. WADA prohibited.',
    humanEvidenceGrade: 'moderate_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'not_fda_approved',
    researchAreas: ['GH axis research', 'Appetite regulation', 'Cachexia research'],
    risks: ['Significant appetite increase', 'Cortisol/prolactin effects', 'WADA prohibited'],
    uncertainties: ['Therapeutic niche vs newer selective GHRPs'],
    knownAdverseEffects: ['Severe hunger', 'Water retention', 'Tiredness after GH peak'],
    references: [
      { id: 'ghrp6-1', title: 'GHRP-6 and the ghrelin receptor', authors: 'Ghigo E et al.', year: 1997, journal: 'J Clin Endocrinol Metab', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'hexarelin',
    name: 'Hexarelin',
    aliases: ['Examorelin', 'HEX'],
    isPeptide: true,
    classification: 'Potent growth hormone releasing peptide (GHS-R agonist)',
    categories: ['gh_secretagogues'],
    summary:
      'A very potent GH secretagogue studied for cardioprotective and GH effects; not FDA approved therapeutically.',
    proposedMechanism:
      'Strong GHS-R agonism producing sharp GH pulses; also studied for direct cardiac CD36 receptor effects independent of GH.',
    researchNotes:
      'Hexarelin produces among the largest GH responses of GHRPs. Studied for cardiac protection in animal models. Desensitization with continuous use observed. WADA prohibited. Human GH data exist; therapeutic development limited.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'not_fda_approved',
    researchAreas: ['GH axis', 'Cardioprotection research', 'Cachexia'],
    risks: ['Tachyphylaxis with chronic use', 'Cortisol/prolactin elevation', 'WADA prohibited'],
    uncertainties: ['Cardioprotective translation to humans'],
    knownAdverseEffects: ['Cortisol increase', 'Prolactin increase', 'Water retention'],
    references: [
      { id: 'hex-1', title: 'Hexarelin pharmacodynamics in humans', authors: 'Camanni F et al.', year: 1998, journal: 'J Clin Endocrinol Metab', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'mk-677',
    name: 'MK-677',
    aliases: ['Ibutamoren', 'Nutrobal'],
    isPeptide: false,
    classification: 'Non-peptide oral ghrelin receptor agonist (investigational)',
    categories: ['gh_secretagogues', 'metabolic_weight'],
    summary:
      'An oral ghrelin mimetic that increases GH and IGF-1 in human trials; investigational with appetite and edema effects.',
    proposedMechanism:
      'Orally bioavailable GHS-R agonist stimulating sustained GH secretion and IGF-1 elevation similar to ghrelin.',
    researchNotes:
      'MK-677 (ibutamoren) increased IGF-1 and lean mass in elderly and GH-deficient populations in trials. Also increases appetite significantly. Not FDA approved. Often discussed alongside peptide secretagogues but is a small molecule, not a peptide. WADA prohibited.',
    humanEvidenceGrade: 'moderate_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'investigational',
    researchAreas: ['GH deficiency', 'Sarcopenia', 'Hip fracture recovery', 'Cachexia'],
    risks: ['Increased appetite', 'Edema', 'Insulin sensitivity reduction', 'Potential prolactin effects'],
    uncertainties: ['Regulatory path', 'Long-term IGF-1 elevation safety'],
    knownAdverseEffects: ['Increased appetite', 'Peripheral edema', 'Muscle pain', 'Numbness'],
    references: [
      { id: 'mk677-1', title: 'MK-677 increases IGF-1 in healthy older adults', authors: 'Nass R et al.', year: 2008, journal: 'Ann Intern Med', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'anamorelin',
    name: 'Anamorelin',
    aliases: ['ONO-7643', 'Ghrelin agonist'],
    isPeptide: false,
    classification: 'Non-peptide ghrelin receptor agonist (approved in Japan for cachexia)',
    categories: ['gh_secretagogues'],
    summary:
      'An oral ghrelin agonist approved in Japan for cancer cachexia; increases GH, appetite, and lean mass in trials.',
    proposedMechanism:
      'GHS-R agonism increasing appetite, GH secretion, and anabolic signaling in cachectic patients.',
    researchNotes:
      'Anamorelin approved in Japan for non-small cell lung cancer cachexia. ROMANA trials showed improved appetite and body weight. Distinct from MK-677 but similar class. Not FDA approved. Not a peptide.',
    humanEvidenceGrade: 'moderate_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'approved_outside_us',
    regulatoryDetail: 'Approved in Japan for cancer cachexia; not FDA approved.',
    researchAreas: ['Cancer cachexia', 'Appetite stimulation', 'GH axis'],
    risks: ['Hyperglycemia', 'Peripheral edema', 'QT prolongation monitoring in trials'],
    uncertainties: ['FDA approval prospects', 'Broader cachexia indications'],
    knownAdverseEffects: ['Hyperglycemia', 'Peripheral edema', 'Nausea'],
    references: [
      { id: 'ana-1', title: 'Anamorelin in cancer cachexia (ROMANA trials)', authors: 'Temel JS et al.', year: 2016, journal: 'Lancet Oncol', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'macimorelin',
    name: 'Macimorelin',
    aliases: ['Macrilen', 'AEZS-130'],
    isPeptide: false,
    classification: 'Non-peptide oral ghrelin receptor agonist (FDA-approved diagnostic)',
    categories: ['gh_secretagogues'],
    summary:
      'An FDA-approved oral diagnostic agent for adult GH deficiency testing via ghrelin receptor stimulation.',
    proposedMechanism:
      'Oral GHS-R agonism provoking GH release for diagnostic assessment of pituitary GH reserve.',
    researchNotes:
      'Macimorelin (Macrilen) is FDA approved as a diagnostic test replacing insulin tolerance test in some settings. Represents validated clinical use of ghrelin pathway agonism. Not a peptide. Not used therapeutically for body composition.',
    humanEvidenceGrade: 'strong_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'fda_approved_specific',
    regulatoryDetail: 'FDA approved for diagnosis of adult growth hormone deficiency.',
    researchAreas: ['GH deficiency diagnosis', 'Endocrine testing'],
    risks: ['QT prolongation caution'],
    uncertainties: ['Global adoption vs traditional stimulation tests'],
    knownAdverseEffects: ['Dysgeusia', 'Dizziness', 'Headache', 'Nausea'],
    references: [
      { id: 'maci-1', title: 'Macimorelin for GH deficiency diagnosis', authors: 'Garcia JM et al.', year: 2018, journal: 'J Clin Endocrinol Metab', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'ghrelin',
    name: 'Ghrelin',
    aliases: ['Lenomorelin', 'Growth hormone secretagogue hormone'],
    isPeptide: true,
    classification: 'Endogenous orexigenic peptide hormone (research and clinical contexts)',
    categories: ['gh_secretagogues'],
    summary:
      'The endogenous gut-brain peptide that stimulates GH release and appetite; studied in cachexia and diagnostic research.',
    proposedMechanism:
      'Binds GHS-R1a on pituitary and hypothalamus, triggering GH release and appetite stimulation.',
    researchNotes:
      'Ghrelin is the natural ligand for the ghrelin receptor. Synthetic mimetics (MK-677, anamorelin) derive from this biology. Native ghrelin studied in cachexia and gastric motility. Human evidence is strong for physiology; therapeutic use of native ghrelin is limited.',
    humanEvidenceGrade: 'moderate_human',
    preclinicalEvidenceGrade: 'strong_human',
    regulatoryStatus: 'investigational',
    researchAreas: ['Appetite regulation', 'GH physiology', 'Cachexia', 'Gastroparesis'],
    risks: ['Appetite stimulation', 'Glucose effects'],
    uncertainties: ['Therapeutic utility vs synthetic agonists'],
    knownAdverseEffects: ['Hunger', 'GI effects'],
    references: [
      { id: 'ghr-1', title: 'Ghrelin: discovery and physiological role', authors: 'Kojima M et al.', year: 1999, journal: 'Nature', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },

  // ─── Sleep / Circadian ────────────────────────────────────────────────────
  {
    id: 'dsip',
    name: 'DSIP',
    aliases: ['Delta sleep-inducing peptide'],
    isPeptide: true,
    classification: 'Neuropeptide sleep research compound (unapproved)',
    categories: ['sleep_circadian'],
    summary:
      'A neuropeptide historically studied for sleep architecture and stress modulation; human evidence remains inconsistent.',
    proposedMechanism:
      'Proposed modulation of sleep-wake regulatory circuits and stress response; exact receptor mechanism not fully established.',
    researchNotes:
      'DSIP was discovered for delta-wave sleep promotion in rabbits. Human studies show inconsistent sleep effects. Russian clinical use reported but Western replication limited. Often sold in research peptide markets without robust evidence. Nasal bioavailability for many peptides is poorly characterized.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'research_stage',
    researchAreas: ['Sleep architecture', 'Stress response', 'Insomnia research'],
    risks: ['Inconsistent efficacy', 'Unregulated products', 'Unknown long-term safety'],
    uncertainties: ['Reproducible sleep benefits in humans', 'Mechanism of action'],
    knownAdverseEffects: ['Morning grogginess reported anecdotally', 'Systematic AE data lacking'],
    references: [
      { id: 'dsip-1', title: 'Delta sleep-inducing peptide: historical and current research', authors: 'Graf MV et al.', year: 1984, journal: 'Peptides', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },

  // ─── Cognitive / Neuropeptide ─────────────────────────────────────────────
  {
    id: 'selank',
    name: 'Selank',
    aliases: ['TP-7', 'N-acetyl Selank'],
    isPeptide: true,
    classification: 'Synthetic tuftsin analog neuropeptide (anxiolytic research; approved in Russia)',
    categories: ['cognitive_neuropeptide'],
    summary:
      'A tuftsin-derived peptide studied for anxiolytic and nootropic effects; Western human evidence remains limited.',
    proposedMechanism:
      'Proposed modulation of GABAergic and serotonergic systems, enkephalin degradation, and BDNF expression.',
    researchNotes:
      'Selank is approved in Russia as an anxiolytic (Tuftsin analog). Russian clinical studies report anxiolytic effects without sedation. Western independent trials are sparse. Intranasal delivery is commonly discussed; nasal bioavailability for many peptides is poorly characterized in rigorous human PK studies. WADA status varies by formulation.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'approved_outside_us',
    regulatoryDetail: 'Registered in Russia; not FDA approved.',
    researchAreas: ['Anxiety research', 'Nootropic research', 'Immune modulation'],
    risks: ['Limited Western validation', 'Unregulated N-acetyl versions', 'Unknown drug interactions'],
    uncertainties: ['Replication of Russian trial results', 'Cognitive enhancement magnitude'],
    knownAdverseEffects: ['Generally reported as well tolerated in Russian studies', 'Fatigue rare'],
    references: [
      { id: 'selank-1', title: 'Selank anxiolytic peptide clinical research in Russia', authors: 'Uchakina ON et al.', year: 2008, journal: 'Bull Exp Biol Med', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'semax',
    name: 'Semax',
    aliases: ['N-acetyl Semax', 'ACTH 4-10 analog'],
    isPeptide: true,
    classification: 'Synthetic ACTH fragment analog neuropeptide (approved in Russia/Ukraine)',
    categories: ['cognitive_neuropeptide'],
    summary:
      'An ACTH-derived peptide studied for cognitive enhancement and neuroprotection; human evidence is region-specific.',
    proposedMechanism:
      'Proposed upregulation of BDNF and NGF, modulation of dopaminergic and serotonergic systems, and neuroprotective signaling.',
    researchNotes:
      'Semax is approved in Russia and Ukraine for stroke and cognitive indications. Russian trials report cognitive improvements. Western replication is limited. Intranasal route commonly discussed. Nasal bioavailability for many peptides is poorly characterized in published Western literature. Often compared to nootropic research compounds.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'approved_outside_us',
    regulatoryDetail: 'Approved in Russia/Ukraine; not FDA approved.',
    researchAreas: ['Stroke recovery', 'Cognitive enhancement', 'ADHD research'],
    risks: ['Limited independent Western trials', 'Unregulated analog products'],
    uncertainties: ['Generalizability of cognitive effects', 'Long-term intranasal use safety'],
    knownAdverseEffects: ['Irritation with intranasal use', 'Generally mild in approved market studies'],
    references: [
      { id: 'semax-1', title: 'Semax in ischemic stroke recovery', authors: 'Gusev EI et al.', year: 1997, journal: 'Zh Nevrol Psikhiatr', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'noopept',
    name: 'Noopept',
    aliases: ['GVS-111', 'N-phenylacetyl-L-prolylglycine ethyl ester'],
    isPeptide: false,
    classification: 'Non-peptide dipeptide derivative nootropic (approved in Russia; not a classical peptide)',
    categories: ['cognitive_neuropeptide'],
    summary:
      'A synthetic nootropic compound structurally related to peptides; cognitive evidence is limited outside Russia.',
    proposedMechanism:
      'Proposed BDNF/NGF upregulation, AMPA receptor modulation, and anti-inflammatory effects in brain tissue.',
    researchNotes:
      'Noopept is approved as a prescription nootropic in Russia. Often miscategorized as a peptide due to structural similarity to dipeptides. Human Western trials are essentially absent. Intranasal use is discussed with poorly characterized bioavailability. Not FDA approved. Technically a synthetic dipeptide derivative, not a classical peptide drug.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'approved_outside_us',
    regulatoryDetail: 'Prescription nootropic in Russia; not FDA approved.',
    researchAreas: ['Cognitive enhancement', 'Neuroprotection', 'Anxiety research'],
    risks: ['Limited safety data outside Russian market', 'Misclassification as peptide'],
    uncertainties: ['Cognitive benefit replication', 'Optimal research populations'],
    knownAdverseEffects: ['Headache', 'Irritability reported anecdotally', 'Russian studies report good tolerance'],
    references: [
      { id: 'noo-1', title: 'Noopept cognitive effects preclinical and clinical overview', authors: 'Ostrovskaya RU et al.', year: 2002, journal: 'Pharmacol Biochem Behav', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },

  // ─── General / Additional from guide ──────────────────────────────────────
  {
    id: 'glutathione',
    name: 'Glutathione',
    aliases: ['GSH', 'Reduced glutathione'],
    isPeptide: true,
    classification: 'Endogenous tripeptide antioxidant (supplement and research use)',
    categories: ['general', 'cosmetic_skin'],
    summary:
      'A major endogenous antioxidant tripeptide; systemic and intranasal supplementation effects remain inconsistently demonstrated.',
    proposedMechanism:
      'Primary cellular antioxidant and detoxification cofactor via glutathione peroxidase and reductase systems.',
    researchNotes:
      'Glutathione supplementation is studied for skin lightening, oxidative stress, and liver health. Oral bioavailability is debated (liposomal forms studied). Intranasal delivery is discussed but results are inconsistent and not robustly proven. Human evidence varies by indication and route.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'not_fda_approved',
    regulatoryDetail: 'Marketed as supplement; IV form used clinically in some regions for acetaminophen toxicity (different context).',
    researchAreas: ['Oxidative stress', 'Skin pigmentation research', 'Liver health'],
    risks: ['Supplement quality variability', 'Limited bioavailability orally', 'Bronchospasm with nebulized forms in asthmatics'],
    uncertainties: ['Effective systemic elevation via non-IV routes', 'Skin lightening durability'],
    knownAdverseEffects: ['Generally well tolerated', 'GI upset with oral forms'],
    references: [
      { id: 'gsh-1', title: 'Glutathione supplementation and skin melanin index', authors: 'Arjinpathana N et al.', year: 2012, journal: 'J Clin Aesthet Dermatol', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'nad-plus',
    name: 'NAD+',
    aliases: ['Nicotinamide adenine dinucleotide'],
    isPeptide: false,
    classification: 'Non-peptide coenzyme (research and IV supplement context)',
    categories: ['general'],
    summary:
      'A fundamental cellular coenzyme; direct supplementation and intranasal delivery lack robust evidence for systemic elevation.',
    proposedMechanism:
      'Electron carrier in oxidative phosphorylation; substrate for sirtuins and PARPs in aging and DNA repair pathways.',
    researchNotes:
      'NAD+ IV infusions are popular in longevity clinics but oral/nasal bioavailability of intact NAD+ is questionable (precursors like NMN/NR more studied). Intranasal NAD+ is discussed with inconsistent evidence. Not a peptide. Research focuses on precursors rather than direct NAD+ in most rigorous studies.',
    humanEvidenceGrade: 'limited_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'not_fda_approved',
    researchAreas: ['Aging research', 'Metabolic health', 'Neurodegeneration research'],
    risks: ['IV infusion reactions', 'Unproven intranasal efficacy', 'Cost without proven benefit for many claims'],
    uncertainties: ['Direct NAD+ vs precursor supplementation strategies'],
    knownAdverseEffects: ['Flushing with IV', 'Nausea possible'],
    references: [
      { id: 'nad-1', title: 'NAD+ metabolism and aging research review', authors: 'Verdin E', year: 2015, journal: 'Science', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'gw0742',
    name: 'GW0742',
    aliases: ['PPARδ agonist'],
    isPeptide: false,
    classification: 'Non-peptide PPAR-delta agonist (preclinical research compound)',
    categories: ['metabolic_weight'],
    summary:
      'A PPAR-delta agonist related to GW501516, studied preclinically for metabolic effects; no human clinical validation.',
    proposedMechanism:
      'PPARδ activation increasing fatty acid oxidation and endurance capacity in animal models.',
    researchNotes:
      'GW0742 is sometimes promoted as a safer alternative to GW501516 but lacks human trials. Preclinical metabolic and endurance data exist. Carcinogenicity profile may differ from GW501516 but is not established in long-term human studies. Not a peptide.',
    humanEvidenceGrade: 'preclinical_only',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'research_stage',
    researchAreas: ['Metabolic research', 'Endurance physiology'],
    risks: ['No human safety data', 'Unknown cancer risk profile', 'Unregulated sale'],
    uncertainties: ['Any safe human application', 'Differentiation from GW501516 risks'],
    knownAdverseEffects: ['Not established in humans'],
    references: [
      { id: 'gw742-1', title: 'PPARδ agonists in metabolic disease models', authors: 'Narkar VA et al.', year: 2008, journal: 'Cell', evidenceType: 'animal' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'gc-1',
    name: 'GC-1',
    aliases: ['SO-133755', 'TRβ-selective thyromimetic'],
    isPeptide: false,
    classification: 'Non-peptide thyroid receptor beta agonist (research compound)',
    categories: ['metabolic_weight'],
    summary:
      'A TRβ-selective thyromimetic studied preclinically for metabolic effects with reduced cardiac stimulation vs T3.',
    proposedMechanism:
      'Selective TRβ activation increases metabolic rate and lipoprotein metabolism with less TRα-mediated cardiac effect.',
    researchNotes:
      'GC-1 showed anti-obesity and cholesterol-lowering effects in mice. Human clinical development has been limited. Represents research into selective thyroid mimetics. Not a peptide. Not approved.',
    humanEvidenceGrade: 'preclinical_only',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'research_stage',
    researchAreas: ['Obesity research', 'Dyslipidemia', 'Thyroid receptor pharmacology'],
    risks: ['Thyroid axis perturbation theoretical risk', 'No established human safety'],
    uncertainties: ['Human translatability', 'Therapeutic window'],
    knownAdverseEffects: ['Not characterized in humans'],
    references: [
      { id: 'gc1-1', title: 'TRβ-selective thyromimetic GC-1 in obesity models', authors: 'Grover GJ et al.', year: 2003, journal: 'Endocrinology', evidenceType: 'animal' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'ss-31',
    name: 'SS-31',
    aliases: ['Elamipretide', 'Bendavia', 'MTP-131'],
    isPeptide: true,
    classification: 'Mitochondrial-targeting peptide (investigational)',
    categories: ['healing_recovery', 'general'],
    summary:
      'A mitochondria-targeting peptide studied in heart failure and mitochondrial diseases with mixed phase 2/3 results.',
    proposedMechanism:
      'Associates with cardiolipin in inner mitochondrial membrane, stabilizing electron transport chain and reducing ROS.',
    researchNotes:
      'Elamipretide (SS-31) has been studied in heart failure (PROGRESS trial), mitochondrial myopathy, and Barth syndrome. Phase 3 heart failure trial did not meet primary endpoint. Still investigational for other indications. Represents legitimate mitochondrial peptide drug development.',
    humanEvidenceGrade: 'moderate_human',
    preclinicalEvidenceGrade: 'moderate_human',
    regulatoryStatus: 'investigational',
    researchAreas: ['Heart failure', 'Mitochondrial disease', 'Barth syndrome', 'Kidney disease'],
    risks: ['Trial failures in some indications', 'Incomplete regulatory approval'],
    uncertainties: ['Which indications may succeed', 'Long-term mitochondrial modulation safety'],
    knownAdverseEffects: ['Injection-site reactions', 'Dizziness', 'Generally well tolerated'],
    references: [
      { id: 'ss31-1', title: 'Elamipretide in heart failure (PROGRESS trial)', authors: 'Daubert MA et al.', year: 2022, journal: 'Eur J Heart Fail', evidenceType: 'human' },
    ],
    lastReviewedAt: REV,
  },
  {
    id: 'nasal-delivery-general',
    name: 'Nasal Peptide Delivery (General)',
    aliases: ['Intranasal peptide delivery'],
    isPeptide: false,
    classification: 'Educational topic: route of administration research',
    categories: ['general', 'cognitive_neuropeptide'],
    summary:
      'Nasal delivery is discussed for many peptides, but human bioavailability and brain delivery are poorly characterized for most compounds.',
    proposedMechanism:
      'Proposed absorption via olfactory/trigeminal pathways to systemic circulation and potentially CNS; highly compound-specific.',
    researchNotes:
      'Intranasal delivery is attractive for convenience and potential CNS access. However, nasal bioavailability for many peptides is poorly characterized in rigorous human pharmacokinetic studies. Effects vary by molecular weight, formulation, and device. Oxytocin and some neuropeptides have the most intranasal research, yet replication remains mixed. Researchers caution against assuming injectable-equivalent effects via nasal routes. No vendor-specific absorption data should be used in educational contexts.',
    humanEvidenceGrade: 'insufficient',
    preclinicalEvidenceGrade: 'early_stage',
    regulatoryStatus: 'unknown',
    researchAreas: ['Pharmacokinetics', 'CNS delivery', 'Neuropeptide administration research'],
    risks: ['Overestimating efficacy vs validated routes', 'Inconsistent formulations', 'Nasal mucosa irritation'],
    uncertainties: ['Compound-specific bioavailability for most peptides', 'CNS penetration extent'],
    knownAdverseEffects: ['Nasal irritation', 'Variable absorption'],
    references: [
      { id: 'nasal-1', title: 'Intranasal drug delivery to the brain: challenges and prospects', authors: 'Mistry A et al.', year: 2009, journal: 'Pharm Res', evidenceType: 'review' },
    ],
    lastReviewedAt: REV,
  },
];

