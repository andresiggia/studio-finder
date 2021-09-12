export interface Address {
  address: string,
  latitude: number,
  longitude: number,
}

export const defaultAddress: Address = {
  address: '',
  latitude: 0,
  longitude: 0,
};
