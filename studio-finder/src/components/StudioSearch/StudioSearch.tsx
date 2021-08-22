import React from 'react';
import { withRouter, RouteComponentProps, matchPath } from 'react-router-dom';

// services
import i18n from '../../services/i18n/i18n';
import { getRoutesByName, RouteName } from '../../services/routes/routes';

// components
import StudioList from '../StudioList/StudioList';
import AddressInput from '../AddressInput/AddressInput';

// css
import './StudioSearch.css';

interface State {
  address: string,
  latitude: number,
  longitude: number,
}

interface Props extends RouteComponentProps {
  showResults?: boolean,
}

class StudioSearch extends React.Component<Props, State> {
  mounted = false

  constructor(props: Props) {
    super(props);
    this.state = {
      address: '',
      latitude: 0,
      longitude: 0,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.updateState();
  }

  componentDidUpdate(prevProps: Props) {
    if (this.getSearchParams(prevProps).address !== this.getSearchParams(this.props).address) {
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
    let address = '';
    let latitude = 0;
    let longitude = 0;
    if (isSearchPage) {
      const { query = '' } = match.params as { query?: string };
      const params = new URLSearchParams(query);
      address = params.get('address') || '';
      latitude = Number(params.get('latitude') || 0);
      longitude = Number(params.get('longitude') || 0);
    }
    return {
      address,
      latitude,
      longitude,
    };
  }

  updateState = () => {
    const { address, latitude, longitude } = this.getSearchParams();
    this.setMountedState({
      address,
      latitude,
      longitude,
    });
  }

  onSubmit = (e?: any) => {
    if (e) {
      e.preventDefault(); // prevent form submission
    }
    const { history } = this.props;
    const { address, latitude, longitude } = this.state;
    // if (address) {
    const [route] = getRoutesByName([RouteName.search]);
    const paramsString = new URLSearchParams({
      address,
      latitude: String(latitude),
      longitude: String(longitude),
    }).toString();
    history.push(`${route.path}/${paramsString}`);
    // }
  }

  // render

  render() {
    const { showResults } = this.props;
    const { address, latitude, longitude } = this.state;
    return (
      <>
        <div className="studio-search">
          <AddressInput
            value={address}
            placeholder={i18n.t('Location or post code')}
            onChange={(response) => this.setMountedState({
              address: response.address,
              latitude: response.latitude,
              longitude: response.longitude,
            }, () => this.onSubmit())}
          />
        </div>
        {(showResults && !!address) && (
          <StudioList latitude={latitude} longitude={longitude} />
        )}
      </>
    );
  }
}

export default withRouter(StudioSearch);
