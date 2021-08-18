import { Address } from '../api/address';
import i18n from '../i18n/i18n';

import apiKey from './key';
import geocodeSample from './geocode.sample.json';
import autocompleteSample from './autocomplete.sample.json';

const SAMPLE_TIMEOUT = 2000;
// FROM GEOAPIFY/GEOCODE https://apidocs.geoapify.com/docs/geocoding/forward-geocoding/#about
const GEOCODE_URL = 'https://api.geoapify.com/v1/geocode/search';
// FROM GEOAPIFY/AUTOCOMPLETE https://apidocs.geoapify.com/docs/geocoding/address-autocomplete/#autocomplete
const AUTOCOMPLETE_URL = 'https://api.geoapify.com/v1/geocode/autocomplete';

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

const getApi = async (text: string, baseUrl: string, sample?: any): Promise<Address[]> => {
  if (sample) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const address = convertToAddress(geocodeSample);
        resolve(address);
      }, SAMPLE_TIMEOUT);
    });
  }
  const requestOptions = { method: 'GET' };
  const params = new URLSearchParams({
    apiKey,
    text,
    lang: i18n.language.substr(0, 2),
  }).toString();
  const url = `${baseUrl}?${params}&filter=countrycode:gb`; // filtering only UK results
  // eslint-disable-next-line no-console
  console.log('will request api', url, requestOptions);
  const response = await fetch(url, requestOptions);
  const responseJson = await response.json();
  return convertToAddress(responseJson);
};

export const geocodeAddress = (text: string, useSample?: boolean) => (
  getApi(text, GEOCODE_URL, useSample ? geocodeSample : null)
);

export const autocompleteAddress = (text: string, useSample?: boolean) => (
  getApi(text, AUTOCOMPLETE_URL, useSample ? autocompleteSample : null)
);
