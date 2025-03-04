export const COLLECTIONS = {
  USERS: 'users',
  CHILDRENS: 'childrens',
  EMOTIONS: 'emotions',
  EMOTION_RECORDS: 'records', // Used as subcollection of EMOTIONS
} as const;

// TypeScript type for collection names
export type CollectionName = keyof typeof COLLECTIONS;

// TypeScript type for subcollection names
export type SubCollectionName = 'records';

// Helper function to get emotion records collection path
export const getEmotionRecordsPath = (userId: string) => 
  `${COLLECTIONS.EMOTIONS}/${userId}/${COLLECTIONS.EMOTION_RECORDS}`; 