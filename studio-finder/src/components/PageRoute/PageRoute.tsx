import React from 'react';
import { Route, RouteProps } from 'react-router-dom';

interface Props extends RouteProps {
  title?: string,
}

const TITLE_PREFIX = 'StudioFinder';

class PageRoute extends React.Component<Props> {
  componentDidMount() {
    const { title } = this.props;
    if (title) {
      document.title = `${TITLE_PREFIX} | ${title}`;
    } else {
      document.title = TITLE_PREFIX;
    }
  }

  render() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { title, ...otherProps } = this.props;
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <Route {...otherProps} />;
  }
}

export default PageRoute;
