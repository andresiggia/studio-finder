import { Address } from '../api/address';

export const convertToAddress = (result: any): Address => ({
  address: result.formatted_address,
  city: '',
  country: '',
  latitude: result.geometry.location.lat(),
  longitude: result.geometry.location.lng(),
} as Address);
