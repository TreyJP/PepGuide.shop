export type ProtocolShopLink = {
  id: string;
  href: string;
  /** Button label, e.g. "Shop Refined stack". */
  label: string;
};

export type ProtocolShopLinksDoc = {
  protocolId: string;
  links: ProtocolShopLink[];
  updatedAt: string;
};
