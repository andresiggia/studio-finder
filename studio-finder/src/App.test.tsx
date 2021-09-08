import React from 'react';
import ReactDOM from 'react-dom';

import { AppContextProvider } from './context/AppContext';
import App from './App';

it('renders without crashing', async () => {
  const div = document.createElement('div');
  ReactDOM.render((
    <AppContextProvider>
      <App />
    </AppContextProvider>
  ), div, () => ReactDOM.unmountComponentAtNode(div));
});
