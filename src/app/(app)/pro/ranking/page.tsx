import { redirect } from 'next/navigation';

/** Ranking is now a name-click tier sheet on the Forum — not a standalone page. */
export default function ProRankingPage() {
  redirect('/pro/forum');
}
