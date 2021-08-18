import React from 'react';
import {
  IonList, IonInput, IonItem, IonSpinner, IonText,
} from '@ionic/react';

// services
import i18n from '../../services/i18n/i18n';
import { geocodeAddress } from '../../services/geoapify/geocode';
import { Address, defaultAddress } from '../../services/api/address';

// components
import Notification, { NotificationType } from '../Notification/Notification';

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

interface State {
  isLoading: boolean,
  error: Error | null,
  queryString: string,
  results: Address[] | null,
}

class AddressInput extends React.Component<Props, State> {
  mounted = false

  DEFAULT_STATE = {
    isLoading: false,
    error: null,
    queryString: '',
    results: null,
  } as State

  constructor(props: Props) {
    super(props);
    this.state = { ...this.DEFAULT_STATE };
  }

  componentDidMount() {
    this.mounted = true;
  }

  componentDidUpdate(prevProps: Props) {
    const { value } = this.props;
    if (prevProps.value !== value) {
      this.onReset();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  setMountedState = (state: any, callback?: () => any) => {
    if (this.mounted) {
      this.setState(state, callback);
    } else {
      // eslint-disable-next-line no-console
      console.log('unmounted request', state);
      if (typeof callback === 'function') {
        callback();
      }
    }
  }

  onReset = () => {
    this.setMountedState(this.DEFAULT_STATE);
  }

  onInputChange = (queryString = '') => {
    const { minChars = 3 } = this.props;
    const hasReachedMinChars = queryString.length >= minChars;
    this.setMountedState({
      ...this.DEFAULT_STATE,
      isLoading: hasReachedMinChars,
      queryString,
    }, async () => {
      if (hasReachedMinChars) {
        try {
          const results = await geocodeAddress(queryString);
          const { queryString: currentQuery } = this.state;
          if (currentQuery === queryString) { // prevent saving outdated query
            // eslint-disable-next-line no-console
            console.log('got address results', results);
            this.setMountedState({
              isLoading: false,
              results,
            });
          }
        } catch (error) {
          const { queryString: currentQuery } = this.state;
          if (currentQuery === queryString) { // prevent saving outdated query
            // eslint-disable-next-line no-console
            console.warn('error - onSearch');
            this.setMountedState({
              isLoading: false,
              error,
            });
          }
        }
      }
    });
  }

  // render

  renderResults = (results: Address[]) => {
    const { onChange } = this.props;
    return (
      <IonList className="address-input-results">
        {results.length === 0
          ? (
            <IonText color="medium" className="address-input-results-none">
              {`(${i18n.t('No results')})`}
            </IonText>
          ) : results.map((result) => (
            <IonItem
              key={result.address}
              button
              onClick={() => onChange(result)}
            >
              {result.address}
            </IonItem>
          ))}
      </IonList>
    );
  }

  render() {
    const {
      value, placeholder, disabled = false, required = false, color, onChange,
    } = this.props;
    const {
      queryString, results, isLoading, error,
    } = this.state;
    return (
      <div className="address-input">
        <IonInput
          value={value || queryString}
          type="text"
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          clearInput={!!value}
          clearOnEdit={!!value}
          color={color}
          onIonChange={(e: any) => {
            if (!value) { // input was updated
              this.onInputChange(e.detail.value);
            } else if (!e.detail.value) { // input was cleared
              onChange(defaultAddress);
            }
          }}
        />
        {!value && (
          <>
            {isLoading && (
              <div className="address-input-loading">
                <IonSpinner name="bubbles" />
              </div>
            )}
            {!!error && (
              <Notification
                type={NotificationType.danger}
                className="address-input-notification"
                header={i18n.t('Error')}
                message={error?.message || i18n.t('An error occurred, please try again later')}
                onDismiss={() => this.setMountedState({ error: null })}
              />
            )}
            {!!results && (
              this.renderResults(results)
            )}
          </>
        )}
      </div>
    );
  }
}

export default AddressInput;
