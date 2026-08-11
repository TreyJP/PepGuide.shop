/** One-on-one Pro consults with the PepGuide admin team. */
export type ProConsultStatus = 'open' | 'answered' | 'closed';

export type ProConsultMessage = {
  id: string;
  consultId: string;
  body: string;
  authorId: string;
  authorDisplayName: string;
  authorIsAdmin: boolean;
  createdAt: string;
};

export type ProConsult = {
  id: string;
  userId: string;
  userDisplayName: string;
  subject: string;
  status: ProConsultStatus;
  createdAt: string;
  updatedAt: string;
  lastMessagePreview: string;
  messageCount: number;
  searchText: string;
};
