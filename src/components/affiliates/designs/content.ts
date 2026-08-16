import {
  AFFILIATE_FIRST_ORDER_COMMISSION_PERCENT,
  AFFILIATE_RECURRING_COMMISSION_PERCENT,
} from '@/src/constants/referral-affiliates';

export const AFFILIATE_HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Get your tracked link',
    description:
      'PepGuide links your account to an affiliate seat and gives you a personal /r/CODE share URL.',
  },
  {
    step: '02',
    title: 'Post it on your channels',
    description:
      'Add the link to Instagram, TikTok, X, YouTube, or your link tree. Every click is counted.',
  },
  {
    step: '03',
    title: 'Earn on orders',
    description: `Referred members keep your code at signup. You earn ${AFFILIATE_FIRST_ORDER_COMMISSION_PERCENT}% on their first paid order, then ${AFFILIATE_RECURRING_COMMISSION_PERCENT}% on every order after.`,
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
    title: 'Click + signup tracking',
    description:
      'Your /r/CODE link records clicks from socials and link trees, then attributes signups when they create an account.',
  },
  {
    id: 'trust',
    title: 'Creator seats',
    description:
      'Affiliate access is provisioned by PepGuide. Linked partners see clicks, signups, and their share link in one console.',
  },
] as const;

export const AFFILIATE_FAQ = [
  {
    id: 'where-link',
    question: 'Where do I put my link?',
    answer:
      'Anywhere you share PepGuide — bio links, stories, Discord, email, or a link-tree slot. Use the /r/CODE URL so clicks are tracked.',
  },
  {
    id: 'when-paid',
    question: 'When do I get paid?',
    answer:
      'Commission applies to paid orders from members who signed up with your code. Payout details are coordinated with PepGuide.',
  },
  {
    id: 'change-code',
    question: 'Can I change my code?',
    answer:
      'Ask PepGuide admin to update your seat if you need a new code. Old links stop working once the code changes.',
  },
] as const;
