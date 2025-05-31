export interface Category {
  id: string;
  version: number;
  versionModifiedAt: string;
  lastMessageSequenceNumber: number;
  createdAt: string;
  lastModifiedAt: string;
  lastModifiedBy: {
    isPlatformClient: boolean;
  };
  createdBy: {
    isPlatformClient: boolean;
  };
  key: string;
  name: {
    'en-GB': string;
    'en-US': string;
    'de-DE': string;
  };
  slug: {
    'en-GB': string;
    'en-US': string;
    'de-DE': string;
  };
  ancestors: [];
  orderHint: string;
  assets: [];
}
