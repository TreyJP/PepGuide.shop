export type SeoGuide = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  category: string;
  tags: string[];
  relatedPeptideIds: string[];
  publishedAt: string;
  updatedAt: string;
  introduction: string;
  sections: Array<{ id: string; heading: string; body: string[] }>;
  faqs: Array<{ question: string; answer: string }>;
  references: Array<{ label: string; note: string }>;
};

/**
 * High-quality educational guides only — not auto-generated thin pages.
 * Content is educational/research-oriented; no dosing or sourcing instructions.
 */
export const SEO_GUIDES: SeoGuide[] = [
  {
    slug: 'what-are-peptides',
    title: 'What Are Peptides?',
    seoTitle: "What Are Peptides? Beginner's Guide",
    description:
      'A clear introduction to peptides: what they are, how researchers talk about them, evidence levels, and how to read educational summaries on PepGuide.',
    category: 'Foundations',
    tags: ['beginner', 'education', 'peptides'],
    relatedPeptideIds: ['semaglutide', 'bpc-157', 'ghk-cu'],
    publishedAt: '2026-08-20',
    updatedAt: '2026-08-20',
    introduction:
      'Peptides are short chains of amino acids. In research and medicine, some peptides are extensively studied and approved for specific uses, while many others remain investigational or preclinical. PepGuide organizes educational information so you can explore compounds without confusing marketing claims for established evidence.',
    sections: [
      {
        id: 'definition',
        heading: 'A practical definition',
        body: [
          'Amino acids linked in short chains are commonly called peptides. Longer chains may be described as polypeptides or proteins depending on context and length conventions used in a field.',
          'Not every research chemical marketed as a “peptide” is equally well characterized. Classification, purity, and regulatory status matter when interpreting online information.',
        ],
      },
      {
        id: 'research-vs-approved',
        heading: 'Approved medicines vs research compounds',
        body: [
          'Some peptides are FDA-approved for specific labeled indications (for example, certain GLP-1 receptor agonists under product-specific labeling). Approval does not mean every related compound or unapproved formulation has equivalent evidence.',
          'Many peptides discussed online are investigational or limited to preclinical models. Early findings should not be treated as established clinical fact.',
        ],
      },
      {
        id: 'evidence-levels',
        heading: 'How PepGuide talks about evidence',
        body: [
          'PepGuide separates strong human evidence, limited human data, early-stage research, and preclinical-only findings. Animal and in-vitro results can inform mechanisms but do not automatically translate to humans.',
          'When a page lists risks, uncertainties, or adverse effects, those notes summarize publicly discussed research considerations — not personalized medical advice.',
        ],
      },
      {
        id: 'how-to-use-pepguide',
        heading: 'How to use PepGuide responsibly',
        body: [
          'Use compound pages and guides to learn vocabulary, compare evidence grades, and find primary references when available.',
          'PepGuide does not sell peptides, prescribe treatments, or provide reconstitution/injection instructions. For medical decisions, consult qualified clinicians and primary literature.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Are all peptides the same?',
        answer:
          'No. Peptides differ in structure, studied uses, evidence quality, safety characterization, and regulatory status. Treat each compound on its own merits.',
      },
      {
        question: 'Does PepGuide recommend buying peptides?',
        answer:
          'PepGuide is educational. Vendor directories on the platform are for discovery and comparison of third-party offerings with disclosed affiliate relationships where applicable — not medical recommendations.',
      },
    ],
    references: [
      {
        label: 'Compound profiles on PepGuide',
        note: 'Summaries are derived from curated knowledge entries with graded evidence labels and cited titles where available.',
      },
    ],
  },
  {
    slug: 'how-to-read-a-peptide-coa',
    title: 'How to Read a Peptide COA',
    seoTitle: 'How to Read a Peptide COA (Certificate of Analysis)',
    description:
      'Learn what a certificate of analysis (COA) typically includes, what purity and identity tests mean, and how to think critically about third-party testing claims.',
    category: 'Testing & quality',
    tags: ['COA', 'purity', 'testing'],
    relatedPeptideIds: [],
    publishedAt: '2026-08-20',
    updatedAt: '2026-08-20',
    introduction:
      'A certificate of analysis (COA) is a lab report describing tested characteristics of a sample lot. COAs can support transparency, but they are not a guarantee of safety, legality, or clinical appropriateness. This guide explains common fields and limitations.',
    sections: [
      {
        id: 'what-coa-is',
        heading: 'What a COA is (and is not)',
        body: [
          'A COA typically documents results for a specific lot: identity, purity, and sometimes contaminants. It is a snapshot of tested material under stated methods — not a clinical endorsement.',
          'Marketing pages may show sample COAs that do not match the lot you receive. Lot numbers, dates, and lab identity matter.',
        ],
      },
      {
        id: 'common-fields',
        heading: 'Common COA fields',
        body: [
          'Identity methods (for example HPLC or mass spectrometry) help support whether the sample matches an expected compound signature.',
          'Purity percentages describe the proportion of the intended analyte under the test method. High reported purity does not automatically mean the product is appropriate for any use.',
          'Residual solvents, endotoxin, or heavy metals may appear on more complete panels. Absence of a test from a COA means that attribute was not reported — not that it is fine.',
        ],
      },
      {
        id: 'limitations',
        heading: 'Limitations and red flags',
        body: [
          'Unclear lab accreditation, missing lot linkage, heavily cropped PDFs, or impossible purity claims deserve skepticism.',
          'PepGuide may surface vendor testing claims as platform information. Always verify documents with the issuing lab when possible.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Does a COA prove a vendor is trustworthy?',
        answer:
          'A COA can support transparency for a lot, but trust also depends on consistency, documentation quality, and independent verification. One PDF is not a full diligence process.',
      },
    ],
    references: [
      {
        label: 'Analytical chemistry basics',
        note: 'Interpret HPLC/MS claims cautiously; method details determine what a purity number means.',
      },
    ],
  },
  {
    slug: 'peptide-purity-testing',
    title: 'Peptide Purity Testing Explained',
    seoTitle: 'Peptide Purity Testing: HPLC, Identity & Limits',
    description:
      'An educational overview of peptide purity testing concepts, including what HPLC-based purity claims usually mean and why methods matter.',
    category: 'Testing & quality',
    tags: ['purity', 'HPLC', 'testing'],
    relatedPeptideIds: [],
    publishedAt: '2026-08-20',
    updatedAt: '2026-08-20',
    introduction:
      'Purity testing is often discussed in peptide research supply contexts. Understanding method limits helps you avoid over-interpreting a single percentage.',
    sections: [
      {
        id: 'hplc',
        heading: 'HPLC purity in plain language',
        body: [
          'High-performance liquid chromatography (HPLC) separates sample components. A reported purity often reflects the relative peak area of the main analyte under a specific method.',
          'Different methods, columns, and detection settings can change results. Comparing purity numbers across labs without method context can be misleading.',
        ],
      },
      {
        id: 'identity',
        heading: 'Identity vs purity',
        body: [
          'Identity testing asks “is this the expected compound?” Purity asks “how much of the measured signal is that compound under this method?” Both matter.',
          'Mass spectrometry is commonly used alongside chromatography for identity support.',
        ],
      },
      {
        id: 'practical',
        heading: 'Practical takeaways for researchers',
        body: [
          'Prefer lot-linked documents, clear lab identity, and method detail when available.',
          'PepGuide’s educational pages highlight testing concepts so you can ask better questions — not so you can self-prescribe or compound products.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Is 99% purity always better?',
        answer:
          'Higher reported purity can be desirable in research contexts, but method quality, contaminants not covered by the assay, and documentation integrity also matter.',
      },
    ],
    references: [
      {
        label: 'Method-dependent results',
        note: 'Treat cross-vendor purity comparisons as approximate unless methods are comparable.',
      },
    ],
  },
  {
    slug: 'how-peptide-research-works',
    title: 'How Peptide Research Works',
    seoTitle: 'How Peptide Research Works: Evidence From Lab to Clinic',
    description:
      'Understand the path from preclinical peptide research to human trials, and how PepGuide labels evidence strength on compound pages.',
    category: 'Foundations',
    tags: ['research', 'evidence', 'clinical trials'],
    relatedPeptideIds: ['semaglutide', 'tirzepatide', 'retatrutide'],
    publishedAt: '2026-08-20',
    updatedAt: '2026-08-20',
    introduction:
      'Peptide research spans chemistry, cell models, animal studies, and human trials. Knowing where a claim sits on that ladder prevents overconfidence.',
    sections: [
      {
        id: 'preclinical',
        heading: 'Preclinical research',
        body: [
          'In-vitro and animal studies explore mechanisms and early signals. They are valuable for hypothesis generation but are not human outcome proof.',
        ],
      },
      {
        id: 'clinical',
        heading: 'Human clinical research',
        body: [
          'Phase 1–3 programs evaluate safety and efficacy in defined populations. Even positive trials apply to studied doses, formulations, and inclusion criteria.',
          'Approved products carry labeled indications and warnings that do not automatically transfer to related research compounds.',
        ],
      },
      {
        id: 'pepguide-labels',
        heading: 'PepGuide evidence labels',
        body: [
          'Compound pages use grades such as strong human, moderate human, limited human, early-stage, and preclinical-only. These labels summarize the character of available evidence — not medical recommendations.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Why do some popular peptides have weak human evidence?',
        answer:
          'Online popularity often outpaces formal trials. Anecdotes and preclinical papers can spread faster than controlled human data.',
      },
    ],
    references: [
      {
        label: 'PepGuide compound evidence grades',
        note: 'See individual peptide pages for compound-specific summaries and cited study titles where available.',
      },
    ],
  },
  {
    slug: 'peptide-storage',
    title: 'Peptide Storage Concepts (Educational)',
    seoTitle: 'Peptide Storage: Educational Stability Concepts',
    description:
      'Educational overview of why storage conditions are discussed in research contexts. Not product-specific handling instructions.',
    category: 'Foundations',
    tags: ['storage', 'stability'],
    relatedPeptideIds: [],
    publishedAt: '2026-08-20',
    updatedAt: '2026-08-20',
    introduction:
      'Peptides can be sensitive to temperature, moisture, and light depending on sequence and formulation. This page explains why storage is discussed in research literature — without providing preparation instructions.',
    sections: [
      {
        id: 'why-storage-matters',
        heading: 'Why storage conditions are studied',
        body: [
          'Stability studies examine how molecules degrade over time under defined conditions. Results are formulation-specific.',
          'Marketing claims about “shelf life” should be tied to validated data for that product presentation.',
        ],
      },
      {
        id: 'what-pepguide-does-not-cover',
        heading: 'What PepGuide does not provide',
        body: [
          'PepGuide does not provide reconstitution, injection, or dosing instructions. Those topics require appropriate clinical or laboratory protocols outside this educational product.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Can I get storage instructions for a specific vial here?',
        answer:
          'No. PepGuide stays educational. Follow manufacturer or institutional protocols for laboratory materials, and clinician guidance for approved medicines.',
      },
    ],
    references: [
      {
        label: 'Formulation-specific stability',
        note: 'Always prefer primary documentation for a given product presentation.',
      },
    ],
  },
  {
    slug: 'vendor-research-and-testing',
    title: 'Peptide Vendor Research & Testing',
    seoTitle: 'Peptide Vendor Research & Testing',
    description:
      'How PepGuide approaches vendor discovery, testing transparency, and COA literacy without inventing ratings or unverified claims.',
    category: 'Vendors',
    tags: ['vendors', 'testing', 'COA'],
    relatedPeptideIds: [],
    publishedAt: '2026-08-20',
    updatedAt: '2026-08-20',
    introduction:
      'Researchers often compare third-party vendors on transparency, documentation, and catalog clarity. PepGuide surfaces factual partner information and educational testing concepts — not fabricated scorecards.',
    sections: [
      {
        id: 'what-we-show',
        heading: 'What PepGuide shows about vendors',
        body: [
          'Vendor directory pages list publicly configured partner details such as name, website destination, and disclosed discount programs where applicable.',
          'Lab-test checklists on the platform reflect partner-configured information when available and may be incomplete.',
        ],
      },
      {
        id: 'what-we-do-not-invent',
        heading: 'What we do not invent',
        body: [
          'PepGuide does not fabricate purity results, certifications, customer review stars, or clinical endorsements for vendors.',
          'Affiliate relationships may exist; educational content should still be evaluated independently.',
        ],
      },
    ],
    faqs: [
      {
        question: 'Are listed vendors medically endorsed by PepGuide?',
        answer:
          'No. Listings support discovery and education. They are not prescriptions, sourcing advice for personal use, or quality guarantees.',
      },
    ],
    references: [
      {
        label: 'PepGuide vendor directory',
        note: 'See /vendors for crawlable partner pages with factual fields only.',
      },
    ],
  },
];

export function getGuideBySlug(slug: string): SeoGuide | undefined {
  return SEO_GUIDES.find((g) => g.slug === slug);
}

export function relatedGuidesForPeptide(peptideId: string, limit = 4): SeoGuide[] {
  const scored = SEO_GUIDES.map((g) => {
    let score = 0;
    if (g.relatedPeptideIds.includes(peptideId)) score += 5;
    if (g.category === 'Foundations') score += 2;
    if (g.tags.includes('education') || g.tags.includes('beginner')) score += 1;
    if (g.category === 'Testing & quality') score += 1;
    return { guide: g, score };
  })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.guide.title.localeCompare(b.guide.title));

  return scored.slice(0, limit).map((row) => row.guide);
}

export function relatedGuidesForGuide(slug: string, limit = 4): SeoGuide[] {
  const current = getGuideBySlug(slug);
  if (!current) return SEO_GUIDES.slice(0, limit);
  return SEO_GUIDES.filter((g) => g.slug !== slug)
    .map((g) => ({
      guide: g,
      score:
        (g.category === current.category ? 3 : 0) +
        g.tags.filter((t) => current.tags.includes(t)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.guide);
}
