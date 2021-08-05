// import { AppContextValue } from '../../context/AppContext';

// import { convertDateFields, updateObjectKeysToCamelCase, updateObjectKeysToUnderscoreCase } from './helpers';
// import { TableName } from './tables';
// import { ViewName } from './views';

export enum BookingReviewError {
  notLoggedIn = 'notLoggedIn',
  missingStudioId = 'missingStudioId',
  missingSpaceId = 'missingSpaceId',
  invalidResponse = 'invalidResponse',
  missingBookingRoles = 'missingBookingRoles',
}

export interface BookingReview {
  bookingId: number,
  spaceId: number,
  userId: string,
  title: string,
  description: string,
  stars: number,
  createdAt: Date | null,
}
export const defaultBookingReview: BookingReview = {
  bookingId: 0,
  spaceId: 0,
  userId: '',
  title: '',
  description: '',
  stars: 0,
  createdAt: null,
};
// const bookingReviewDateFields = ['createdAt'];
