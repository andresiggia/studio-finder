import React from 'react';
import {
  IonCol, IonGrid, IonRow, IonSpinner,
} from '@ionic/react';

// context
import AppContext from '../../context/AppContext';

// services
import i18n from '../../services/i18n/i18n';
import { getStudios, StudioProfile } from '../../services/api/studios';

// components
import Notification, { NotificationType } from '../Notification/Notification';

// css
import './StudioList.css';

// interface Filters {

// }

// interface Props {
//   // filters?: Filters,
// }

interface State {
  isLoading: boolean,
  error: Error | null,
  items: StudioProfile[] | null,
}

class StudioList extends React.Component<any, State> {
  mounted = false

  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      items: null,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadData();
  }

  // componentDidUpdate(prevProps: any) {
  //   if (this.getSearchParams(prevProps) !== this.getSearchParams(this.props)) {
  //     this.loadData();
  //   }
  // }

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

  loadData = () => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        const items = await getStudios(this.context);
        this.setMountedState({
          isLoading: false,
          items,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('error - loadData', error);
        this.setMountedState({
          isLoading: false,
          error,
        });
      }
    });
  }

  render() {
    const { isLoading, error, items } = this.state;
    if (isLoading) {
      return (
        <div className="booking-form-loading booking-form-spacer">
          <IonSpinner name="bubbles" />
        </div>
      );
    }
    if (error) {
      return (
        <Notification
          type={NotificationType.danger}
          className="booking-form-notification booking-form-spacer"
          header={i18n.t('Error')}
          message={error?.message || i18n.t('An error occurred, please try again later')}
          onDismiss={() => this.setMountedState({ error: null })}
        />
      );
    }
    if (!items || items.length === 0) {
      return (
        <p>{i18n.t('No results found')}</p>
      );
    }
    return (
      <>
        <p>{i18n.t('Found {{count}} result', { count: items.length })}</p>
        <IonGrid>
          <IonRow>
            {items.map((item) => (
              <IonCol key={item.id} size="12" size-sm="6" size-md="4" size-lg="3">
                {item.title}
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </>
    );
  }
}

StudioList.contextType = AppContext;

export default StudioList;
