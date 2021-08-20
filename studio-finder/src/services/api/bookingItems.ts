import { AppContextValue } from '../../context/AppContext';
import { isValidDate } from '../helpers/misc';

import {
  convertFromAPI, convertDateForComparison, updateObjectKeysToUnderscoreCase,
} from './helpers';
import { TableName } from './tables';
import { ViewName } from './views';

export enum BookingItemError {
  notLoggedIn = 'notLoggedIn',
  missingBookingId = 'missingBookingId',
  missingStudioId = 'missingStudioId',
  missingSpaceId = 'missingSpaceId',
  invalidResponse = 'invalidResponse',
  missingBookingRoles = 'missingBookingRoles',
  editingItemOfWrongBooking = 'editingItemOfWrongBooking',
  missingDateRange = 'missingDateRange',
}

export interface BookingItem {
  id: number,
  inactive: boolean,
  bookingId: number,
  spaceId: number,
  serviceType: string,
  serviceTitle: string,
  servicePrice: number,
  quantity: number,
  notes: string,
  startAt: Date | null,
  endAt: Date | null,
}
export const defaultBookingItem: BookingItem = {
  id: 0,
  inactive: false,
  bookingId: 0,
  spaceId: 0,
  serviceType: '',
  serviceTitle: '',
  servicePrice: 0,
  quantity: 0,
  notes: '',
  startAt: null,
  endAt: null,
};
const bookingItemDateFields: (keyof BookingItem)[] = ['startAt', 'endAt'];
export const bookingItemRequiredFields: (keyof BookingItem)[] = ['spaceId', 'serviceType', 'endAt', 'startAt'];

export interface BookingItemWithBooking extends BookingItem {
  studioId: number,
  userId: string,
  createdBy: string,
  modifiedBy: string,
  studioTitle: string,
  userName: string,
  userSurname: string,
  createdByName: string,
  createdBySurname: string,
  modifiedByName: string,
  modifiedBySurname: string,
  spaceTitle: string,
}

export interface BookingDate {
  spaceId: number,
  serviceTitle: string,
  serviceType: string,
  servicePrice: number,
  date: Date,
}

export const getBookingItemsByUser = async (context: AppContextValue, props?: {
  start?: number, limit?: number, showPastItems?: boolean,
}) => {
  const { start = 0, limit = 1000, showPastItems } = props || {};
  const { supabase, state } = context;
  const userId = state.user?.id;
  if (!userId) {
    throw new Error(BookingItemError.notLoggedIn);
  }
  let data: any[] | null = null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (showPastItems) {
    const { data: dataPast, error } = await supabase
      .from(ViewName.bookingItemsWithBooking)
      .select()
      .gte('start_at', convertDateForComparison(today))
      .order('start_at', { ascending: true })
      .range(start, start + limit - 1);
    if (error) {
      throw error;
    }
    data = dataPast;
  } else {
    const { data: dataFuture, error } = await supabase
      .from(ViewName.bookingItemsWithBooking)
      .select()
      .lt('start_at', convertDateForComparison(today))
      .order('start_at', { ascending: true })
      .range(start, start + limit - 1);
    if (error) {
      throw error;
    }
    data = dataFuture;
  }
  let bookingItems: BookingItemWithBooking[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    bookingItems = data.map((item: any) => convertFromAPI(item, bookingItemDateFields));
  }
  return bookingItems;
};

export const getBookingItemsByBooking = async (context: AppContextValue, props: {
  bookingId?: number, start?: number, limit?: number,
}) => {
  const { bookingId, start = 0, limit = 1000 } = props;
  if (!bookingId) {
    throw new Error(BookingItemError.missingBookingId);
  }
  const { supabase } = context;
  const { data, error } = await supabase
    .from(ViewName.bookingItemsWithBooking)
    .select()
    .eq('booking_id', bookingId)
    .range(start, start + limit - 1);
  if (error) {
    throw error;
  }
  let bookingItems: BookingItemWithBooking[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    bookingItems = data.map((item: any) => convertFromAPI(item, bookingItemDateFields));
  }
  return bookingItems;
};

export const getBookingItemsBySpace = async (context: AppContextValue, props: {
  inactive?: boolean, spaceId?: number, fromDate: Date, toDate: Date,
  start?: number, limit?: number,
}) => {
  const {
    inactive, spaceId, fromDate, toDate, start = 0, limit = 1000,
  } = props;
  if (!spaceId) {
    throw new Error(BookingItemError.missingSpaceId);
  }
  if (!isValidDate(fromDate) || !isValidDate(toDate)) {
    throw new Error(BookingItemError.missingDateRange);
  }
  const { supabase } = context;
  let data: any[] | null = null;
  if (typeof inactive === 'boolean') {
    const { data: data1, error } = await supabase
      .from(ViewName.bookingItemsWithBooking)
      .select()
      .gte('start_at', convertDateForComparison(fromDate))
      .lte('end_at', convertDateForComparison(toDate))
      .eq('inactive', inactive)
      .eq('space_id', spaceId)
      .range(start, start + limit - 1);
    if (error) {
      throw error;
    }
    data = data1;
  } else {
    const { data: data2, error } = await supabase
      .from(ViewName.bookingItemsWithBooking)
      .select()
      .gte('start_at', convertDateForComparison(fromDate))
      .lte('end_at', convertDateForComparison(toDate))
      .eq('space_id', spaceId)
      .range(start, start + limit - 1);
    if (error) {
      throw error;
    }
    data = data2;
  }
  let bookingItems: (BookingItemWithBooking | BookingItem)[] = [];
  if (data && Array.isArray(data) && data.length > 0) {
    bookingItems = data.map((item: any) => convertFromAPI(item, bookingItemDateFields));
  }
  return bookingItems;
};

export const setBookingItem = async (context: AppContextValue, {
  bookingItem, bookingId,
}: {
  bookingItem: BookingItem, bookingId: number,
}) => {
  if (!bookingId) {
    throw new Error(BookingItemError.missingBookingId);
  }
  const isEditing = !!bookingItem.id;
  const itemObj: any = {
    ...bookingItem,
  };
  if (!isEditing) { // inserting new row
    itemObj.bookingId = bookingId; // inject bookingId for new items
    delete itemObj.id; // id should be created by back-end
  } else if (itemObj.bookingId !== bookingId) { // only when editing
    // bookingId must match value provided
    throw new Error(BookingItemError.editingItemOfWrongBooking);
  }
  const itemData = updateObjectKeysToUnderscoreCase(itemObj);
  // eslint-disable-next-line no-console
  console.log('will upsert bookingItem', itemData);
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableName.bookingItems)
    .upsert([itemData]);
  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error(BookingItemError.invalidResponse);
  }
  const [newRow] = data;
  // eslint-disable-next-line no-console
  console.log('got new booking info', newRow, data);
  return newRow;
};

export const deleteBookingItem = async (context: AppContextValue, id: number) => {
  const { supabase } = context;
  const { data, error } = await supabase
    .from(TableName.bookingItems)
    .delete()
    .match({ id });
  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error(BookingItemError.invalidResponse);
  }
  return data;
};
