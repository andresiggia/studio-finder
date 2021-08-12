import { AppContextValue } from '../../context/AppContext';

import { convertDateFields, updateObjectKeysToCamelCase, updateObjectKeysToUnderscoreCase } from './helpers';
import { TableName } from './tables';
import { ViewName } from './views';

export enum BookingError {
  notLoggedIn = 'notLoggedIn',
  missingStudioId = 'missingStudioId',
  missingSpaceId = 'missingSpaceId',
  invalidResponse = 'invalidResponse',
  missingBookingRoles = 'missingBookingRoles',
}

export interface Booking {
  id: number,
  studioId: number,
  userId: string,
  actId: number | null,
  createdBy: string,
  modifiedBy: string,
  notes: string,
  createdAt: Date | null,
  modifiedAt: Date | null,
}
export const defaultBooking: Booking = {
  id: 0,
  studioId: 0,
  userId: '',
  actId: null,
  createdBy: '',
  modifiedBy: '',
  notes: '',
  createdAt: null,
  modifiedAt: null,
};
const bookingDateFields: (keyof Booking)[] = ['createdAt', 'modifiedAt'];
export const bookingRequiredFields: (keyof Booking)[] = ['studioId', 'userId'];

export interface BookingWithUser extends Booking {
  studioTitle: string,
  userName: string,
  userSurname: string,
  createdByName: string,
  createdBySurname: string,
  modifiedByName: string,
  modifiedBySurname: string,
  actTitle: string,
}
export const defaultBookingWithUser: BookingWithUser = {
  ...defaultBooking,
  studioTitle: '',
  userName: '',
  userSurname: '',
  createdByName: '',
  createdBySurname: '',
  modifiedByName: '',
  modifiedBySurname: '',
  actTitle: '',
};

export const getBookings = async (context: AppContextValue, props: {
  studioId: number, start?: number, limit?: number, includeUser?: boolean,
}) => {
  const {
    studioId, start = 0, limit = 100, includeUser,
  } = props || {};
  if (!studioId) {
    throw new Error(BookingError.missingStudioId);
  }
  const { supabase } = context;
  const { data, error } = await supabase
    .from(includeUser
      ? ViewName.bookingsWithUser
      : TableName.bookings)
    .select()
    .eq('studio_id', studioId)
    .range(start, start + limit - 1);
  if (error) {
    throw error;
  }
  let bookings: (Booking | BookingWithUser)[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    bookings = data.map((item: any) => convertDateFields(updateObjectKeysToCamelCase(item), bookingDateFields));
  }
  return bookings;
};

export const getBooking = async (context: AppContextValue, props: {
  bookingId: number, includeUser?: boolean,
}) => {
  const { bookingId, includeUser } = props;
  const { supabase } = context;
  const { data, error } = await supabase
    .from(includeUser
      ? ViewName.bookingsWithUser
      : TableName.bookings)
    .select()
    .eq('id', bookingId)
    .single();
  if (error) {
    throw error;
  }
  let booking: Booking | BookingWithUser | null = null;
  if (data && data.id === bookingId) {
    booking = convertDateFields(updateObjectKeysToCamelCase(data), bookingDateFields);
  }
  return booking;
};

export const upsertBooking = async (context: AppContextValue, booking: Booking) => {
  const { supabase, state } = context;
  const userId = state.user?.id;
  if (!userId) {
    throw new Error(BookingError.notLoggedIn);
  }
  const isEditing = !!booking.id;
  const bookingObj: any = {
    ...booking,
    modifiedAt: new Date(), // modifiedAt to be updated to current date/time
  };
  if (!isEditing) { // inserting new row
    bookingObj.createdBy = userId; // injecting user id provided
    delete bookingObj.createdAt; // createdAt should be created by back-end
    delete bookingObj.id; // id should be created by back-end
  } else {
    bookingObj.modifiedBy = userId; // injecting user id provided
  }
  const bookingData = updateObjectKeysToUnderscoreCase(bookingObj);
  const { data, error } = await supabase
    .from(TableName.bookings)
    .upsert([bookingData]);
  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error(BookingError.invalidResponse);
  }
  const [newRow] = data;
  // eslint-disable-next-line no-console
  console.log('got new booking info', newRow, data);
  return newRow;
};
