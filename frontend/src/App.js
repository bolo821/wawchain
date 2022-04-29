import React from 'react';
import './css/style.css';
import Index from './jsx';
import './App.css';

import { Provider } from 'react-redux';
import { store } from './store';
import Web3Provider from './Web3Provider';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Provider store={store}>
      <Web3Provider>
        <div>
          <ToastContainer pauseOnFocusLoss={false} autoClose={5000} hideProgressBar={false} closeOnClick />
          <Index />
        </div>
      </Web3Provider>
    </Provider>
  );
}

export default App;