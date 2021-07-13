export const TABLE_NAMES = {
  users: 'users',
};

export interface UserProfile {
  id: string,
  name?: string,
  surname?: string,
  birthday?: Date | null,
  postCode?: string,
  city?: string,
  region?: string,
  country?: string,
  photoUrl?: string,
  createdAt: Date,
  modifiedAt: Date,
}
