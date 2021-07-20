export enum userTypes {
  studio = 'studio',
  musician = 'musician',
}

export interface UserProfile {
  id: string,
  name: string,
  surname: string,
  birthday: Date | null,
  postCode: string,
  city: string,
  region: string,
  country: string,
  photoUrl: string,
  createdAt: Date | null,
  modifiedAt: Date | null,
}

export const defaultUserProfile: UserProfile = {
  id: '',
  name: '',
  surname: '',
  birthday: null,
  postCode: '',
  city: '',
  region: '',
  country: '',
  photoUrl: '',
  createdAt: null,
  modifiedAt: null,
};
