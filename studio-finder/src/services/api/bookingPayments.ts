// import { AppContextValue } from '../../context/AppContext';

// import { convertDateFields, updateObjectKeysToCamelCase, updateObjectKeysToUnderscoreCase } from './helpers';
// import { TableName } from './tables';
// import { ViewName } from './views';

// export enum BookingPaymentError {
// }

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
