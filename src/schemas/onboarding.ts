import { z } from 'zod';

export const onboardingSchema = z.object({
  researchInterests: z
    .array(z.string())
    .min(1, 'Select at least one research interest'),
  experienceLevel: z.enum([
    'completely_new',
    'basic',
    'intermediate',
    'advanced',
  ]),
  researchPreferences: z.array(z.string()).min(1, 'Select at least one preference'),
  responsibleUseAccepted: z.literal(true, {
    errorMap: () => ({
      message: 'Confirmation is required before continuing',
    }),
  }),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
