import React from 'react';
import {
  IonInput,
} from '@ionic/react';
import AutoComplete from 'react-google-autocomplete';

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

class AddressInput extends React.Component<Props> {
  render() {
    const {
      value, placeholder, disabled = false, required = false, color, onChange,
    } = this.props;
    return (
      <div
        className={`address-input ${
          value ? '' : 'sc-ion-input-md-h sc-ion-input-md-s md'
        }`}
      >
        {value
          ? (
            <IonInput
              value={value}
              type="text"
              disabled={disabled}
              required={required}
              placeholder={placeholder}
              clearInput={!!value}
              clearOnEdit={!!value}
              color={color}
              onIonInput={() => {
                onChange(defaultAddress);
              }}
              onIonChange={(e: any) => {
                if (!e.detail.value) { // input was cleared
                  onChange(defaultAddress);
                }
              }}
            />
          ) : (
            <AutoComplete
              apiKey={googleAPIKey}
              className="native-input sc-ion-input-md"
              options={{
                types: ['address'],
                componentRestrictions: { country: 'gb' },
              }}
              language={i18n.language}
              placeholder={placeholder}
              onPlaceSelected={(place) => {
                const address = convertToAddress(place);
                // eslint-disable-next-line no-console
                console.log('got address', address, 'from', place);
                onChange(address);
              }}
            />
          )}
      </div>
    );
  }
}

export default AddressInput;
