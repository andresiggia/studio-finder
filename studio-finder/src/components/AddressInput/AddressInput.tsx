import React, { useState } from 'react';
import {
  IonInput, IonItem, IonList, IonSpinner, IonText,
} from '@ionic/react';
import usePlacesService from 'react-google-autocomplete/lib/usePlacesAutocompleteService';

// services
import i18n from '../../services/i18n/i18n';
import { convertToAddress } from '../../services/google/places';
import { Address, defaultAddress } from '../../services/api/address';
import { googleAPIKey } from '../../secrets';

// css
import './AddressInput.css';

interface Props {
  value: string,
  minChars?: number,
  disabled?: boolean,
  required?: boolean,
  placeholder?: string,
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark',
  onChange: (address: Address) => void,
}

const AddressInput: React.FC<Props> = ({
  value, placeholder, disabled = false, required = false, color, minChars = 3, onChange,
}) => {
  const [queryString, setQueryString] = useState('');
  const {
    placesService, getPlacePredictions, autocompleteSessionToken, isPlacePredictionsLoading, placePredictions,
  } = usePlacesService({
    apiKey: googleAPIKey,
    language: i18n.language,
  });
  return (
    <div className="address-input">
      <IonInput
        value={value || queryString}
        type="text"
        disabled={disabled}
        required={required}
        clearInput={!!value}
        clearOnEdit={!!value}
        color={color}
        placeholder={placeholder}
        onIonChange={(e: any) => {
          const newValue = e.detail.value;
          setQueryString(newValue);
          if (!value) { // input was updated
            if (newValue.length >= minChars) {
              getPlacePredictions({
                input: newValue,
                componentRestrictions: { country: 'GB' },
                sessionToken: autocompleteSessionToken,
              });
            }
          } else if (!newValue) { // input was cleared
            onChange(defaultAddress);
          }
        }}
      />
      {isPlacePredictionsLoading && (
        <div className="address-input-loading">
          <IonSpinner name="bubbles" />
        </div>
      )}
      {(!value && !!placePredictions && !isPlacePredictionsLoading && queryString.length >= minChars) && (
        <IonList className="address-input-results">
          {placePredictions.length === 0
            ? (
              <IonText color="medium" className="address-input-results-none">
                {`(${i18n.t('No results')})`}
              </IonText>
            ) : placePredictions.map((prediction) => (
              <IonItem
                key={prediction.place_id}
                button
                onClick={() => placesService?.getDetails({
                  placeId: prediction.place_id,
                }, (placeDetails: any) => {
                  // eslint-disable-next-line no-console
                  console.log('place details', placeDetails);
                  const address = convertToAddress(placeDetails);
                  setQueryString('');
                  onChange(address);
                })}
              >
                {prediction.description}
              </IonItem>
            ))}
        </IonList>
      )}
    </div>
  );
  // }
};

export default AddressInput;
