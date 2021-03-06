import { AppContextValue } from '../../context/AppContext';

import { convertFromAPI, convertToAPI } from './helpers';
import { TableName } from './tables';
import { ViewName } from './views';

export enum BookingError {
  notLoggedIn = 'notLoggedIn',
  missingStudioId = 'missingStudioId',
  missingSpaceId = 'missingSpaceId',
  invalidResponse = 'invalidResponse',
  missingBookingRoles = 'missingBookingRoles',
  editingBookingOfWrongStudio = 'editingBookingOfWrongStudio',
}

export interface Booking {
  id: number,
  studioId: number,
  userId: string | null,
  createdBy: string | null,
  modifiedBy: string | null,
  notes: string,
  createdAt: Date | null,
  modifiedAt: Date | null,
}
export const defaultBooking: Booking = {
  id: 0,
  studioId: 0,
  userId: null,
  createdBy: null,
  modifiedBy: null,
  notes: '',
  createdAt: null,
  modifiedAt: null,
};
const bookingDateFields: (keyof Booking)[] = ['createdAt', 'modifiedAt'];
export const bookingRequiredFields: (keyof Booking)[] = ['studioId'];

export interface BookingWithUser extends Booking {
  studioTitle: string,
  userName: string,
  userSurname: string,
  createdByName: string,
  createdBySurname: string,
  modifiedByName: string,
  modifiedBySurname: string,
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
};

export const getBookingsByUser = async (context: AppContextValue, props?: {
  start?: number, limit?: number,
}) => {
  const { start = 0, limit = 1000 } = props || {};
  const { supabase, state } = context;
  const userId = state.user?.id;
  if (!userId) {
    throw new Error(BookingError.notLoggedIn);
  }
  const { data, error } = await supabase
    .from(TableName.bookings)
    .select()
    .eq('inactive', false)
    .eq('user_id', userId)
    .order('modified_at', { ascending: false })
    .range(start, start + limit - 1);
  if (error) {
    throw error;
  }
  let bookings: (Booking | BookingWithUser)[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    bookings = data.map((item: any) => convertFromAPI(item, bookingDateFields));
  }
  return bookings;
};

export const getBookings = async (context: AppContextValue, props: {
  studioId: number, start?: number, limit?: number, includeUser?: boolean,
}) => {
  const {
    studioId, start = 0, limit = 1000, includeUser,
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
    bookings = data.map((item: any) => convertFromAPI(item, bookingDateFields));
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
    booking = convertFromAPI(data, bookingDateFields);
  }
  return booking;
};

export const setBooking = async (context: AppContextValue, {
  booking, studioId,
}: {
  booking: Booking, studioId?: number,
}) => {
  const { supabase, state } = context;
  const userId = state.user?.id;
  if (!userId) {
    throw new Error(BookingError.notLoggedIn);
  }
  const isEditing = !!booking.id;
  const itemObj: any = { ...booking };
  if (!studioId && !itemObj.studioId) {
    throw new Error(BookingError.missingStudioId);
  }
  if (!isEditing) { // inserting new row
    if (studioId) {
      itemObj.studioId = studioId; // injecting studioId provided
    }
    itemObj.createdBy = userId; // injecting user id provided
    delete itemObj.createdAt; // createdAt should be created by back-end
    delete itemObj.id; // id should be created by back-end
  } else {
    if (studioId && studioId !== itemObj.studioId) {
      throw new Error(BookingError.editingBookingOfWrongStudio);
    }
    itemObj.modifiedBy = userId; // injecting user id provided
    itemObj.modifiedAt = new Date(); // modifiedAt to be updated to current date/time
  }
  const itemData = convertToAPI(itemObj, bookingDateFields);
  const { data, error } = await supabase
    .from(TableName.bookings)
    .upsert([itemData]);
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
