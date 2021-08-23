import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { googleAPIKey } from '../../secrets';

// services
import i18n from '../../services/i18n/i18n';

// css
import './Map.css';

interface Props {
  // width?: number | string,
  // height?: number | string,
  latitude: number,
  longitude: number,
  label?: string,
}

class Map extends React.Component<Props> {
  render() {
    const {
      latitude, longitude, label,
    } = this.props;
    return (
      <div className="map-container map-container-16by9">
        <LoadScript googleMapsApiKey={googleAPIKey} language={i18n.language}>
          <GoogleMap
            mapContainerClassName="map-item"
            center={{
              lat: latitude,
              lng: longitude,
            }}
            zoom={16}
          >
            { /* Child components, such as markers, info windows, etc. */}
            <Marker
              label={label}
              position={{
                lat: latitude,
                lng: longitude,
              }}
            />
          </GoogleMap>
        </LoadScript>
      </div>
    );
  }
}

export default React.memo(Map);
