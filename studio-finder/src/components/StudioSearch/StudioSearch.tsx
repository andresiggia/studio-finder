import React from 'react';
import {
  IonButton, IonInput,
} from '@ionic/react';
import { withRouter, RouteComponentProps, matchPath } from 'react-router-dom';

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

interface Props extends RouteComponentProps {
  showResults?: boolean,
}

class StudioSearch extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      query: '',
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.updateState();
  }

  componentDidUpdate(prevProps: Props) {
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
      path: route.otherPaths ? [route.path, ...route.otherPaths] : route.path,
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
    // if (query) {
    const [route] = getRoutesByName([RouteName.search]);
    history.push(`${route.path}/${encodeURIComponent(query)}`);
    // }
  }

  // render

  render() {
    const { showResults } = this.props;
    const { query } = this.state;
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
          >
            {i18n.t('Search')}
          </IonButton>
        </form>
        {showResults && (
          <StudioList />
        )}
      </>
    );
  }
}

export default withRouter(StudioSearch);