import { AppContextValue } from '../../context/AppContext';

import { convertDateFields, updateObjectKeysToCamelCase, updateObjectKeysToUnderscoreCase } from './helpers';
import { TableName } from './tables';
import { ViewName } from './views';

export enum BookingItemError {
  notLoggedIn = 'notLoggedIn',
  missingBookingId = 'missingBookingId',
  missingStudioId = 'missingStudioId',
  missingSpaceId = 'missingSpaceId',
  invalidResponse = 'invalidResponse',
  missingBookingRoles = 'missingBookingRoles',
}

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
const bookingItemDateFields: (keyof BookingItem)[] = ['startAt', 'endAt'];
export const bookingItemRequiredFields: (keyof BookingItem)[] = ['spaceId', 'serviceType', 'endAt', 'startAt'];

export interface BookingItemWithBooking extends BookingItem {
  studioId: number,
  userId: string,
  actId: number,
  createdBy: string,
  modifiedBy: string,
  studioTitle: string,
  userName: string,
  userSurname: string,
  createdByName: string,
  createdBySurname: string,
  modifiedByName: string,
  modifiedBySurname: string,
  actTitle: string,
  spaceTitle: string,
}

export const getBookingItems = async (context: AppContextValue, props: {
  spaceId?: number, bookingId?: number, start?: number, limit?: number, includeBookingAndUser?: boolean
}) => {
  const {
    spaceId, bookingId, start = 0, limit = 100, includeBookingAndUser,
  } = props;
  if (!spaceId && !bookingId) { // at least one param is required
    throw new Error(BookingItemError.missingSpaceId);
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

export const upsertBookingItem = async (context: AppContextValue, {
  bookingItem, bookingId,
}: {
  bookingItem: BookingItem, bookingId: number,
}) => {
  const { supabase, state } = context;
  const userId = state.user?.id;
  if (!userId) {
    throw new Error(BookingItemError.notLoggedIn);
  }
  const isEditing = !!bookingItem.id;
  const itemObj: any = {
    ...bookingItem,
    modifiedAt: new Date(), // modifiedAt to be updated to current date/time
  };
  if (!isEditing) { // inserting new row
    if (!bookingId) {
      throw new Error(BookingItemError.missingBookingId);
    }
    itemObj.bookingId = bookingId; // inject bookingId for new items
    delete itemObj.id; // id should be created by back-end
  }
  const bookingData = updateObjectKeysToUnderscoreCase(itemObj);
  const { data, error } = await supabase
    .from(TableName.bookings)
    .upsert([bookingData]);
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
    .from(TableName.bookings)
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
