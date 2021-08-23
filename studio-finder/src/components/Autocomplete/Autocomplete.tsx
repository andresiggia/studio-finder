import React from 'react';
import {
  IonList, IonInput, IonItem, IonSpinner, IonText,
} from '@ionic/react';

// services
import i18n from '../../services/i18n/i18n';

// components
import Notification, { NotificationType } from '../Notification/Notification';

// css
import './Autocomplete.css';

export interface Result {
  label: string,
  value: any,
  disabled?: boolean,
}

interface Props {
  value: string,
  minChars?: number,
  disabled?: boolean,
  required?: boolean,
  placeholder?: string,
  color?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'light' | 'medium' | 'dark',
  onSearch: (query: string) => Promise<Result[]>,
  onSelect: (item?: Result) => void,
}

interface State {
  isLoading: boolean,
  error: Error | null,
  query: string,
  results: Result[] | null,
}

class Autocomplete extends React.Component<Props, State> {
  mounted = false

  DEFAULT_STATE = {
    isLoading: false,
    error: null,
    query: '',
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

  onInputChange = (query = '') => {
    const { minChars = 3, onSearch } = this.props;
    const hasReachedMinChars = query.length >= minChars;
    this.setMountedState({
      ...this.DEFAULT_STATE,
      isLoading: hasReachedMinChars,
      query,
    }, async () => {
      if (hasReachedMinChars) {
        try {
          const results = await onSearch(query);
          const { query: currentQuery } = this.state;
          if (currentQuery === query) { // prevent saving outdated query
            // eslint-disable-next-line no-console
            console.log('got results', results);
            this.setMountedState({
              isLoading: false,
              results,
            });
          }
        } catch (error) {
          const { query: currentQuery } = this.state;
          if (currentQuery === query) { // prevent saving outdated query
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

  renderResults = (results: any[]) => {
    const { onSelect } = this.props;
    return (
      <IonList className="autocomplete-input-results">
        {results.length === 0
          ? (
            <IonText color="medium" className="autocomplete-input-results-none">
              {`(${i18n.t('No results')})`}
            </IonText>
          ) : results.map((result, index) => (
            <IonItem
              key={result.key || index}
              button
              disabled={result.disabled}
              onClick={() => onSelect(result)}
            >
              {result.label}
            </IonItem>
          ))}
      </IonList>
    );
  }

  render() {
    const {
      value, placeholder, disabled = false, required = false, color, onSelect,
    } = this.props;
    const {
      query, results, isLoading, error,
    } = this.state;
    return (
      <div className="autocomplete-input">
        <IonInput
          value={value || query}
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
            } else if (e.detail.value !== value) { // input was cleared
              onSelect();
            }
          }}
        />
        {!value && (
          <>
            {isLoading && (
              <div className="autocomplete-input-loading">
                <IonSpinner name="bubbles" />
              </div>
            )}
            {!!error && (
              <Notification
                type={NotificationType.danger}
                className="autocomplete-input-notification"
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

export default Autocomplete;
