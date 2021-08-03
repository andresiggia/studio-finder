import { AppContextValue } from '../../context/AppContext';

import { convertDateFields, updateObjectKeysToCamelCase, updateObjectKeysToUnderscoreCase } from './helpers';
import { SpaceProfile } from './spaces';
import { StudioProfile } from './studios';
import { TableName } from './tables';
import { ViewName } from './views';

export enum BookingError {
  missingUserId = 'missingUserId',
  missingStudioId = 'missingStudioId',
  missingSpaceId = 'missingSpaceId',
  invalidResponse = 'invalidResponse',
  missingBookingRoles = 'missingBookingRoles',
  editingBookingOfWrongStudio = 'editingBookingOfWrongStudio',
  editingBookingOfWrongSpace = 'editingBookingOfWrongSpace',
}

export interface BookingPayment {
  id: number,
  bookingId: number,
  userId: number,
  vendor: string,
  metadata: any,
  value: number,
  isPaid: boolean,
  createdAt: Date | null,
}
export const defaultBookingPayment: BookingPayment = {
  id: 0,
  bookingId: 0,
  userId: 0,
  vendor: '',
  metadata: null,
  value: 0,
  isPaid: false,
  createdAt: null,
};
// const bookingPaymentDateFields = ['createdAt'];

export interface BookingReview {
  bookingId: number,
  spaceId: number,
  userId: number,
  title: string,
  description: string,
  stars: number,
  createdAt: Date | null,
}
export const defaultBookingReview: BookingReview = {
  bookingId: 0,
  spaceId: 0,
  userId: 0,
  title: '',
  description: '',
  stars: 0,
  createdAt: null,
};
// const bookingReviewDateFields = ['createdAt'];

export interface BookingItem {
  id: number,
  bookingId: number,
  spaceId: number,
  serviceType: string,
  serviceTitle: string,
  servicePrice: number,
  quantity: number,
  startAt: Date | null,
  endAt: Date | null,
}
export const defaultBookingItem: BookingItem = {
  id: 0,
  bookingId: 0,
  spaceId: 0,
  serviceType: '',
  serviceTitle: '',
  servicePrice: 0,
  quantity: 0,
  startAt: null,
  endAt: null,
};
const bookingItemDateFields = ['startAt', 'endAt'];

export interface Booking {
  id: number,
  studioId: number,
  userId: string,
  actId: number | null,
  createdAt: Date | null,
  modifiedAt: Date | null,
}
export const defaultBooking: Booking = {
  id: 0,
  studioId: 0,
  userId: '',
  actId: null,
  createdAt: null,
  modifiedAt: null,
};
const bookingDateFields = ['createdAt', 'modifiedAt'];

export const getBookings = async (context: AppContextValue, props?: {
  studioId: number, start?: number, limit?: number
}) => {
  const {
    studioId, start = 0, limit = 100,
  } = props || {};
  if (!studioId) {
    throw BookingError.missingStudioId;
  }
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableName.bookings)
    .select()
    .eq('studio_id', studioId)
    .range(start, start + limit - 1);
  if (error) {
    throw error;
  }
  let bookings: Booking[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    bookings = data.map((item: any) => convertDateFields(updateObjectKeysToCamelCase(item), bookingDateFields));
  }
  return bookings;
};

export const getBookingItems = async (context: AppContextValue, props?: {
  spaceId: number, start?: number, limit?: number
}) => {
  const {
    spaceId, start = 0, limit = 100,
  } = props || {};
  if (!spaceId) {
    throw BookingError.missingSpaceId;
  }
  const { supabase } = context;
  const { data, error } = await supabase
    .from(ViewName.bookingItemsWithBooking)
    .select()
    .eq('space_id', spaceId)
    .range(start, start + limit - 1);
  if (error) {
    throw error;
  }
  let bookingItems: BookingItem[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    bookingItems = data.map((item: any) => convertDateFields(updateObjectKeysToCamelCase(item), bookingItemDateFields));
  }
  return bookingItems;
};

export const getBooking = async (context: AppContextValue, bookingId: number) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableName.bookings)
    .select()
    .eq('id', bookingId)
    .single();
  if (error) {
    throw error;
  }
  let booking: any = null;
  if (data && data.id === bookingId) {
    booking = convertDateFields(updateObjectKeysToCamelCase(data), bookingDateFields);
  }
  return booking;
};

export const upsertBooking = async (context: AppContextValue, {
  booking, studioProfile,
}: {
  booking: Booking, studioProfile: StudioProfile,
}) => {
  const { supabase, state } = context;
  const userId = state.user?.id;
  if (!userId) {
    throw BookingError.missingUserId;
  }
  const isEditing = !!booking.id;
  const bookingObj: any = {
    ...booking,
    modifiedAt: new Date(), // modifiedAt to be updated to current date/time
  };
  if (!isEditing) { // inserting new row
    bookingObj.studioId = studioProfile.id; // injecting studio id provided
    bookingObj.userId = userId; // injecting user id provided
    delete bookingObj.createdAt; // createdAt should be created by back-end
    delete bookingObj.id; // id should be created by back-end
  } else if (bookingObj.studioId !== studioProfile.id) { // only when editing
    // studio id must match studioProfile provided
    throw new Error(BookingError.editingBookingOfWrongStudio);
  }
  const bookingData = updateObjectKeysToUnderscoreCase(bookingObj);
  const { data, error } = await supabase
    .from(TableName.bookings)
    .upsert([bookingData]);
  if (error) {
    throw error;
  }
  if (!data) {
    throw BookingError.invalidResponse;
  }
  const [newRow] = data;
  // eslint-disable-next-line no-console
  console.log('got new booking info', newRow, data);
  return data;
};

export const upsertBookingItem = async (context: AppContextValue, {
  booking, spaceProfile,
}: {
  booking: Booking, spaceProfile: SpaceProfile,
}) => {
  const { supabase, state } = context;
  const userId = state.user?.id;
  if (!userId) {
    throw BookingError.missingUserId;
  }
  const isEditing = !!booking.id;
  const bookingObj: any = {
    ...booking,
    modifiedAt: new Date(), // modifiedAt to be updated to current date/time
  };
  if (!isEditing) { // inserting new row
    bookingObj.studioId = spaceProfile.id; // injecting space id provided
    bookingObj.userId = userId; // injecting user id provided
    delete bookingObj.createdAt; // createdAt should be created by back-end
    delete bookingObj.id; // id should be created by back-end
  } else if (bookingObj.spaceId !== spaceProfile.id) { // only when editing
    // studio id must match spaceProfile provided
    throw new Error(BookingError.editingBookingOfWrongSpace);
  }
  const bookingData = updateObjectKeysToUnderscoreCase(bookingObj);
  const { data, error } = await supabase
    .from(TableName.bookings)
    .upsert([bookingData]);
  if (error) {
    throw error;
  }
  if (!data) {
    throw BookingError.invalidResponse;
  }
  const [newRow] = data;
  // eslint-disable-next-line no-console
  console.log('got new booking info', newRow, data);
  return data;
};
