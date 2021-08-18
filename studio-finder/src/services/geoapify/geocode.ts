import { Address } from '../api/address';

import apiKey from './key';
import geocodeAutoCompleteSample from './geocode-autocomplete.sample.json';

// FROM GEOAPIFY/AUTOCOMPLETE https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/#autocomplete
const AUTOCOMPLETE_URL = 'https://api.geoapify.com/v1/geocode/autocomplete';
const SAMPLE_TIMEOUT = 2000;

const convertToAddress = (response: any): Address[] => (
  (response?.features || []).map((feature: any) => {
    const { properties } = feature;
    return {
      address: properties.formatted,
      city: properties.city,
      country: properties.country,
      latitude: properties.lat,
      longitude: properties.long,
    } as Address;
  })
);

export const searchAddress = async (text: string, useSample?: boolean): Promise<Address[]> => {
  if (useSample) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const address = convertToAddress(geocodeAutoCompleteSample);
        resolve(address);
      }, SAMPLE_TIMEOUT);
    });
  }
  const requestOptions = {
    method: 'GET',
    params: {
      apiKey,
      text: encodeURIComponent(text),
      filter: 'countrycode:gb', // only searching UK
    },
  };
  const response = await fetch(AUTOCOMPLETE_URL, requestOptions);
  return convertToAddress(response.json());
};
