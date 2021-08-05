import { AppContextValue } from '../../context/AppContext';

import { convertDateFields, updateObjectKeysToCamelCase, updateObjectKeysToUnderscoreCase } from './helpers';
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
  userId: string,
  vendor: string,
  metadata: any,
  value: number,
  isPaid: boolean,
  createdAt: Date | null,
}
export const defaultBookingPayment: BookingPayment = {
  id: 0,
  bookingId: 0,
  userId: '',
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

export interface BookingItemWithBooking extends BookingItem {
  studioId: number,
  userId: string,
  actId: number,
  studioTitle: string,
  userName: string,
  userSurname: string,
  actTitle: string,
  spaceTitle: string,
}

export interface Booking {
  id: number,
  studioId: number,
  userId: string,
  actId: number | null,
  createdBy: string,
  modifiedBy: string,
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
  createdAt: null,
  modifiedAt: null,
};
const bookingDateFields = ['createdAt', 'modifiedAt'];

export interface BookingWithUser extends Booking {
  studioTitle: string,
  userName: string,
  userSurname: string,
  actTitle: string,
}
export const defaultBookingWithUser: BookingWithUser = {
  ...defaultBooking,
  studioTitle: '',
  userName: '',
  userSurname: '',
  actTitle: '',
};

export const getBookings = async (context: AppContextValue, props?: {
  studioId: number, start?: number, limit?: number, includeUser?: boolean,
}) => {
  const {
    studioId, start = 0, limit = 100, includeUser,
  } = props || {};
  if (!studioId) {
    throw BookingError.missingStudioId;
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

export const getBookingItems = async (context: AppContextValue, props: {
  spaceId?: number, bookingId?: number, start?: number, limit?: number, includeBookingAndUser?: boolean
}) => {
  const {
    spaceId, bookingId, start = 0, limit = 100, includeBookingAndUser,
  } = props;
  if (!spaceId && !bookingId) { // at least one param is required
    throw BookingError.missingSpaceId;
  }
  const { supabase } = context;
  const filterName = spaceId
    ? 'space_id'
    : 'booking_id';
  const filterValue = spaceId || bookingId;
  const { data, error } = await supabase
    .from(includeBookingAndUser
      ? ViewName.bookingItemsWithBooking
      : TableName.bookingItems)
    .select()
    .eq(filterName, filterValue)
    .range(start, start + limit - 1);
  if (error) {
    throw error;
  }
  let bookingItems: (BookingItemWithBooking | BookingItem)[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    bookingItems = data.map((item: any) => convertDateFields(updateObjectKeysToCamelCase(item), bookingItemDateFields));
  }
  return bookingItems;
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

export const upsertBooking = async (context: AppContextValue, {
  booking, studioId,
}: {
  booking: Booking, studioId: number,
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
    bookingObj.studioId = studioId; // injecting studio id provided
    bookingObj.userId = userId; // injecting user id provided
    delete bookingObj.createdAt; // createdAt should be created by back-end
    delete bookingObj.id; // id should be created by back-end
  } else if (bookingObj.studioId !== studioId) { // only when editing
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
  bookingItem, spaceId,
}: {
    bookingItem: BookingItem, spaceId: number,
}) => {
  const { supabase, state } = context;
  const userId = state.user?.id;
  if (!userId) {
    throw BookingError.missingUserId;
  }
  const isEditing = !!bookingItem.id;
  const bookingObj: any = {
    ...bookingItem,
    modifiedAt: new Date(), // modifiedAt to be updated to current date/time
  };
  if (!isEditing) { // inserting new row
    bookingObj.spaceId = spaceId; // injecting space id provided
    bookingObj.userId = userId; // injecting user id provided
    delete bookingObj.createdAt; // createdAt should be created by back-end
    delete bookingObj.id; // id should be created by back-end
  } else if (bookingObj.spaceId !== spaceId) { // only when editing
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

export const deleteBookingItem = async (context: AppContextValue, id: number) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableName.bookings)
    .delete()
    .match({ id });
  if (error) {
    throw error;
  }
  if (!data) {
    throw BookingError.invalidResponse;
  }
  return data;
};
