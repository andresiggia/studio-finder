export enum StudioPhotoError {
  notLoggedIn = 'notLoggedIn',
  missingStudioId = 'missingStudioId',
  invalidResponse = 'invalidResponse',
}

export interface Photo {
  id: number,
  photoUrl: string,
  order: number,
}
export const defaultPhoto: Photo = {
  id: 0,
  photoUrl: '',
  order: 0,
};
export const photoRequiredFields: (keyof Photo)[] = ['photoUrl', 'order'];
