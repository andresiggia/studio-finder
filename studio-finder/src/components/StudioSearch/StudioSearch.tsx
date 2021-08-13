import React from 'react';
import {
  IonButton, IonInput,
} from '@ionic/react';
import { withRouter, RouteComponentProps, matchPath } from 'react-router';

// services
import i18n from '../../services/i18n/i18n';
import { getRoutesByName, RouteName } from '../../services/routes/routes';

// components
import StudioList from '../StudioList/StudioList';

// css
import './StudioSearch.css';

interface State {
  query: string,
}

class StudioSearch extends React.Component<RouteComponentProps, State> {
  mounted = false

  constructor(props: RouteComponentProps) {
    super(props);
    this.state = {
      query: '',
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.updateState();
  }

  componentDidUpdate(prevProps: RouteComponentProps) {
    if (this.getSearchParams(prevProps) !== this.getSearchParams(this.props)) {
      this.updateState();
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

  getSearchParams = (props = this.props) => {
    const { match } = props;
    const [route] = getRoutesByName([RouteName.search]);
    const isSearchPage = matchPath(match.path, {
      path: route.path,
      exact: route.exact,
      strict: route.strict,
    });
    if (isSearchPage) {
      const { query = '' } = match.params as { query?: string };
      return decodeURIComponent(query);
    }
    return '';
  }

  updateState = () => {
    const query = this.getSearchParams();
    this.setMountedState({
      query,
    });
  }

  onSubmit = (e: any) => {
    const { history } = this.props;
    const { query } = this.state;
    e.preventDefault(); // prevent form submission
    if (query) {
      const [route] = getRoutesByName([RouteName.search]);
      history.push(route.path.replace(':query', encodeURIComponent(query)));
    }
  }

  // render

  render() {
    const { query } = this.state;
    const searchParam = this.getSearchParams();
    return (
      <>
        <form onSubmit={this.onSubmit} className="studio-search-form">
          <IonInput
            value={query}
            type="text"
            name="search"
            placeholder={i18n.t('Location or post code')}
            onIonChange={(e: any) => this.setMountedState({ query: e.detail.value })}
          />
          <IonButton
            color="primary"
            type="submit"
            disabled={!query}
          >
            {i18n.t('Search')}
          </IonButton>
        </form>
        {!!searchParam && (
          <StudioList />
        )}
      </>
    );
  }
}

export default withRouter(StudioSearch);
