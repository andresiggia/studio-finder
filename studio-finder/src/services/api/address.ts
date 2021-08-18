export interface Address {
  address: string,
  city: string,
  country: string,
  latitude: number,
  longitude: number,
}

export const defaultAddress: Address = {
  address: '',
  city: '',
  country: '',
  latitude: 0,
  longitude: 0,
};
