export type VendorReview = {
  id: string;
  partnerId: string;
  partnerLabel: string;
  rating: number;
  title: string;
  body: string;
  authorId: string;
  authorDisplayName: string;
  authorIsAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
  searchText: string;
};

export type VendorReviewReply = {
  id: string;
  reviewId: string;
  body: string;
  authorId: string;
  authorDisplayName: string;
  authorIsAdmin: boolean;
  createdAt: string;
};
