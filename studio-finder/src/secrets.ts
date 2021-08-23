const googleAPIKeyDev = process.env.REACT_APP_GOOGLE_API_KEY || '';
const googleAPIKeyProd = 'AIzaSyCfE5rk7byWYSjmd_rzSJRj2rDcvROciD4';

export const googleAPIKey = (process.env.NODE_ENV !== 'production')
  ? googleAPIKeyDev
  : googleAPIKeyProd;
