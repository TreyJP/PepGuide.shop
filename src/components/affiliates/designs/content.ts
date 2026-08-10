import {
  AFFILIATE_FIRST_ORDER_COMMISSION_PERCENT,
  AFFILIATE_RECURRING_COMMISSION_PERCENT,
} from '@/src/constants/referral-affiliates';

export const AFFILIATE_HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Join in one click',
    description:
      'Any PepGuide account can open an affiliate seat and claim a personal signup code.',
  },
  {
    step: '02',
    title: 'Share your link',
    description:
      'Send /sign-up?ref=YOURCODE or have members enter your code when they create an account.',
  },
  {
    step: '03',
    title: 'Earn on orders',
    description: `You earn ${AFFILIATE_FIRST_ORDER_COMMISSION_PERCENT}% on a referred member’s first paid order, then ${AFFILIATE_RECURRING_COMMISSION_PERCENT}% on every order after.`,
  },
] as const;

export const AFFILIATE_BENEFITS = [
  {
    id: 'rates',
    title: `${AFFILIATE_FIRST_ORDER_COMMISSION_PERCENT}% / ${AFFILIATE_RECURRING_COMMISSION_PERCENT}% commission`,
    description: `First paid order from each referred member pays ${AFFILIATE_FIRST_ORDER_COMMISSION_PERCENT}%. Every order after that pays ${AFFILIATE_RECURRING_COMMISSION_PERCENT}%.`,
  },
  {
    id: 'attribution',
    title: 'Simple attribution',
    description:
      'One code, one link. Signups are attributed at account creation — no cookies required.',
  },
  {
    id: 'trust',
    title: 'Open to every account',
    description:
      'No private invite list. Create your affiliate seat anytime and start sharing immediately.',
  },
] as const;

export const AFFILIATE_FAQ = [
  {
    question: 'Who can become an affiliate?',
    answer:
      'Any PepGuide account can join. Open Affiliates, choose a code, and create your seat — no approval wait.',
  },
  {
    question: 'How does commission work?',
    answer: `You earn ${AFFILIATE_FIRST_ORDER_COMMISSION_PERCENT}% on a referred member’s first paid order, then ${AFFILIATE_RECURRING_COMMISSION_PERCENT}% on every paid order after that.`,
  },
  {
    question: 'How do people use my code?',
    answer:
      'They can open your referral link, or type your code into the optional referral field on the signup page. Google sign-up also picks up a code saved from your link.',
  },
  {
    question: 'When is a signup attributed?',
    answer:
      'Only when a new account is created with an active affiliate code. Existing members who sign in later are not re-attributed.',
  },
] as const;
