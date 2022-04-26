import React from 'react';
import './css/style.css';
import Index from './jsx';
import './App.css';

import { Provider } from 'react-redux';
import { store } from './store';

function App() {
  return (
    <Provider store={store}>
      <div>
        <Index />
      </div>
    </Provider>
  );
}

export default App;
