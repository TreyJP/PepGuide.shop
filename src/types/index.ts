export type SubscriptionTier = 'free' | 'pro';
export type AccountStatus = 'active' | 'cooldown' | 'review' | 'suspended';
export type ExperienceLevel =
  | 'completely_new'
  | 'basic'
  | 'intermediate'
  | 'advanced';

export type ResearchInterest =
  | 'body_composition'
  | 'metabolic'
  | 'recovery'
  | 'sleep'
  | 'cognitive'
  | 'healthy_aging'
  | 'skin_hair'
  | 'injury'
  | 'general_education'
  | 'other';

export type ResearchPreference =
  | 'prefer_human_clinical'
  | 'include_early_stage'
  | 'include_animal'
  | 'highly_studied_only'
  | 'always_regulatory'
  | 'always_safety'
  | 'prefer_simple'
  | 'prefer_technical';

export type ResearchMode =
  | 'quick_overview'
  | 'evidence_review'
  | 'compound_comparison'
  | 'deep_research'
  | 'build_report';

export type EvidenceDepth = 'simple' | 'detailed' | 'technical';

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'sending' | 'streaming' | 'complete' | 'error' | 'refused';
export type SafetyAction = 'allow' | 'refuse' | 'urgent_warning' | 'rate_limit';

export type EvidenceGrade =
  | 'strong_human'
  | 'moderate_human'
  | 'limited_human'
  | 'early_stage'
  | 'preclinical_only'
  | 'anecdotal'
  | 'insufficient';

export type RegulatoryStatus =
  | 'fda_approved_specific'
  | 'approved_outside_us'
  | 'investigational'
  | 'compounded_limited'
  | 'not_fda_approved'
  | 'research_stage'
  | 'withdrawn'
  | 'unknown';

export type MessageClassification =
  | 'general_peptide_education'
  | 'research_goal_exploration'
  | 'compound_comparison'
  | 'evidence_review'
  | 'regulatory_status_question'
  | 'personalized_medical_request'
  | 'personalized_dosing_request'
  | 'cycle_or_stack_construction'
  | 'reconstitution_instructions'
  | 'injection_instructions'
  | 'vendor_or_sourcing_request'
  | 'evade_medical_supervision'
  | 'acute_adverse_event'
  | 'minor_user'
  | 'prompt_injection'
  | 'spam'
  | 'out_of_scope'
  | 'automated_scraping'
  | 'repeated_policy_circumvention'
  | 'pro_content_inquiry';

export type SavedItemType =
  | 'ai_response'
  | 'peptide_profile'
  | 'comparison'
  | 'citation'
  | 'research_note'
  | 'report';

export type UserProfile = {
  id: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  createdAt: string;
  onboardingCompleted: boolean;
  emailVerified: boolean;
  subscriptionTier: SubscriptionTier;
  accountStatus: AccountStatus;
  /** ISO timestamp; when set and in the future, chat sending is blocked. */
  chatBlockedUntil: string | null;
  abuseStrikeCount: number;
  /** Total research chats created — used for Pro ranking. */
  chatCount: number;
  researchInterests: ResearchInterest[];
  experienceLevel: ExperienceLevel | null;
  researchPreferences: ResearchPreference[];
  acceptedTermsVersion: string;
  acceptedPrivacyVersion: string;
  acceptedResearchNoticeVersion: string;
  dataRetentionDays: number;
  /** Optional referral affiliate code used at signup. */
  referredByCode: string | null;
  /** Referral affiliate id attributed at signup. */
  referredByAffiliateId: string | null;
};

/** Public Pro ranking / forum identity card. */
export type PublicProfile = {
  id: string;
  displayName: string;
  photoURL: string | null;
  chatCount: number;
  isAdmin: boolean;
  updatedAt: string;
};

export type ForumPost = {
  id: string;
  title: string;
  body: string;
  authorId: string;
  authorDisplayName: string;
  authorIsAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
  searchText: string;
  pinned: boolean;
};

export type ForumReply = {
  id: string;
  postId: string;
  body: string;
  authorId: string;
  authorDisplayName: string;
  authorIsAdmin: boolean;
  createdAt: string;
};

export type ChatSummary = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
  archived: boolean;
  temporary: boolean;
  researchMode: ResearchMode;
  evidenceDepth: EvidenceDepth;
  lastMessagePreview: string;
  messageCount: number;
  safetyStatus: SafetyAction;
};

export type Citation = {
  id: string;
  title: string;
  authors: string;
  year: number;
  journal?: string;
  url?: string;
  evidenceType: 'human' | 'animal' | 'in_vitro' | 'review' | 'other';
};

export type EvidenceCard = {
  peptideId: string;
  name: string;
  aliases: string[];
  researchCategory: string;
  relevanceSummary: string;
  proposedMechanism: string;
  humanEvidenceGrade: EvidenceGrade;
  preclinicalEvidenceGrade: EvidenceGrade;
  regulatoryStatus: RegulatoryStatus;
  regulatoryDetail?: string;
  knownRisks: string[];
  uncertainties: string[];
  citationCount: number;
  lastReviewedAt: string;
};

export type ChatMessage = {
  id: string;
  chatId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  status: MessageStatus;
  classifications: MessageClassification[];
  citations: Citation[];
  evidenceCards: EvidenceCard[];
  safetyAction: SafetyAction;
  modelVersion?: string;
  suggestedQuestions?: string[];
  peptideIds?: string[];
};

export type Peptide = {
  id: string;
  name: string;
  aliases: string[];
  classification: string;
  shortDescription: string;
  researchOverview: string;
  proposedMechanism: string;
  researchCategories: string[];
  humanEvidenceGrade: EvidenceGrade;
  preclinicalEvidenceGrade: EvidenceGrade;
  regulatoryStatus: RegulatoryStatus;
  regulatoryDetail?: string;
  studiedRoutes: string[];
  studyDurationNotes?: string;
  humanEvidenceSummary: string;
  animalEvidenceSummary: string;
  invitroEvidenceSummary: string;
  knownAdverseEffects: string[];
  reportedAdverseEffects: string[];
  contraindicationCategories: string[];
  interactionCategories: string[];
  risks: string[];
  uncertainties: string[];
  ongoingTrials: string[];
  references: Citation[];
  lastReviewedAt: string;
  reviewStatus: 'draft' | 'reviewed' | 'needs_update';
};

export type ComparisonRowKey =
  | 'name'
  | 'classification'
  | 'proposedMechanism'
  | 'researchCategories'
  | 'humanEvidence'
  | 'preclinicalEvidence'
  | 'regulatoryStatus'
  | 'studiedRoutes'
  | 'studyDuration'
  | 'knownRisks'
  | 'uncertainties'
  | 'references';

export type ResearchFolder = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type SavedResearchItem = {
  id: string;
  itemType: SavedItemType;
  title: string;
  content: string;
  sourceChatId?: string;
  peptideIds: string[];
  citations: Citation[];
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ResearchReport = {
  id: string;
  researchQuestion: string;
  compoundsReviewed: string[];
  proposedMechanisms: string;
  humanEvidence: string;
  preclinicalEvidence: string;
  regulatoryStatus: string;
  risksAndLimitations: string;
  comparisonSummary: string;
  unansweredQuestions: string[];
  references: Citation[];
  generatedAt: string;
};

export type PepGuideAiResponse = {
  answer: string;
  classification: MessageClassification;
  safetyAction: SafetyAction;
  evidenceCards: EvidenceCard[];
  citations: Citation[];
  suggestedQuestions: string[];
  peptideIds: string[];
};

/** Personal research log entry — not a prescribed protocol. */
export type CycleFrequency =
  | 'daily'
  | 'twice_daily'
  | 'eod'
  | '2x_week'
  | '3x_week'
  | 'weekly'
  | 'as_needed'
  | 'custom';

export type CycleItem = {
  id: string;
  peptideId: string;
  name: string;
  dose: string;
  frequency: CycleFrequency;
  frequencyLabel?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type UsagePeriod = {
  messagesUsed: number;
  inputTokens: number;
  outputTokens: number;
  deepResearchRuns: number;
  reportsGenerated: number;
};


export type AuthSession = {
  user: UserProfile | null;
  initializing: boolean;
  isAuthenticated: boolean;
};
