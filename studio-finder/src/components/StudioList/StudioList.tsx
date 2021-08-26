import React from 'react';
import {
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonGrid, IonIcon, IonRow, IonSpinner,
} from '@ionic/react';
import {
  withRouter, RouteComponentProps, generatePath,
} from 'react-router-dom';
// eslint-disable-next-line import/no-extraneous-dependencies
import {
  musicalNotes,
} from 'ionicons/icons';

// context
import AppContext from '../../context/AppContext';

// services
import i18n from '../../services/i18n/i18n';
import { getStudios, StudioProfileDisplay } from '../../services/api/studios';
import { getRoutesByName, RouteName } from '../../services/routes/routes';

// components
import Notification, { NotificationType } from '../Notification/Notification';

// css
import './StudioList.css';
import Pagination from '../Pagination/Pagination';

interface Props extends RouteComponentProps {
  latitude?: number,
  longitude?: number,
  limit?: number,
}

interface State {
  isLoading: boolean,
  error: Error | null,
  items: StudioProfileDisplay[] | null,
  count: number,
  start: number,
}

class StudioList extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null,
      items: null,
      count: 0,
      start: 0,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadData();
  }

  componentDidUpdate(prevProps: Props) {
    const { latitude, longitude } = this.props;
    if (prevProps.latitude !== latitude
      || prevProps.longitude !== longitude) {
      this.loadData();
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

  loadData = () => {
    this.setMountedState({
      isLoading: true,
    }, async () => {
      try {
        const { latitude, longitude } = this.props;
        const { items, count } = await getStudios(this.context, {
          lat: latitude, lon: longitude,
        });
        this.setMountedState({
          isLoading: false,
          items,
          count,
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

  onPaginationChange = (start: number) => {
    this.setMountedState({
      start,
    }, () => this.loadData());
  }

  // render

  renderPagination = () => {
    const { limit = 12 } = this.props;
    const {
      count, start, isLoading, error, items,
    } = this.state;
    if (!items) {
      return null;
    }
    const disabled = isLoading || !!error || count <= limit;
    return (
      <Pagination
        className="studio-list-pagination"
        disabled={disabled}
        start={start}
        limit={limit}
        count={count}
        itemsLength={items.length}
        onChange={this.onPaginationChange}
      />
    );
  }

  renderStudio = (item: StudioProfileDisplay) => {
    const { history } = this.props;
    const [route] = getRoutesByName([RouteName.studio]);
    const path = generatePath(route.path, {
      id: item.id,
    });
    return (
      <IonCard
        button
        href={`#${path}`}
        title={item.title}
        className="studio-list-item"
        onClick={(e: any) => {
          e.preventDefault();
          history.push(path);
        }}
      >
        <div
          className="studio-list-item-photo"
          style={{ backgroundImage: `url(${item.photoUrl})` }}
          title={item.photoUrl ? '' : i18n.t('No image to display')}
        >
          {!item.photoUrl && (
            <IonIcon icon={musicalNotes} color="light" />
          )}
        </div>
        <IonCardHeader>
          <IonCardTitle className="studio-list-item-title">
            {item.title}
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent className="studio-list-item-content">
          {!!item.address && (
            <p><strong>{item.address}</strong></p>
          )}
          {!!item.description && (
            <p>{item.description}</p>
          )}
        </IonCardContent>
      </IonCard>
    );
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
      <IonGrid className="studio-list">
        <IonRow>
          {items.map((item) => (
            <IonCol key={item.id} size="12" size-sm="6" size-md="4" size-lg="3">
              {this.renderStudio(item)}
            </IonCol>
          ))}
        </IonRow>
        {this.renderPagination()}
      </IonGrid>
    );
  }
}

StudioList.contextType = AppContext;

export default withRouter(StudioList);
