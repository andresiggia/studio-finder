import React from 'react';
import {
  IonHeader, IonTitle, IonToolbar,
} from '@ionic/react';
import { Link } from 'react-router-dom';

import './HeaderBase.css';

interface Props {
  // children?: ReactChildren,
  titleUrl?: string,
  renderButtons?: () => JSX.Element,
}

class HeaderBase extends React.Component<Props> {
  render() {
    const { titleUrl, children, renderButtons } = this.props;
    return (
      <IonHeader>
        <IonToolbar>
          <IonTitle slot="start" className="header-title">
            {titleUrl
              ? (
                <Link to={titleUrl || ''}>
                  Studio
                  <strong>Finder</strong>
                </Link>
              ) : (
                <>
                  Studio
                  <strong> Finder</strong>
                </>
              )}
          </IonTitle>
          {!!renderButtons && (
            renderButtons()
          )}
        </IonToolbar>

        {children}

      </IonHeader>
    );
  }
}

export default HeaderBase;
