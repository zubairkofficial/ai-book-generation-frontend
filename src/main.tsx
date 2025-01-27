import { createRoot } from 'react-dom/client';
import './index.css';
import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import 'react-toastify/dist/ReactToastify.css';
import App from './App.tsx';
import { ToastProvider } from './context/ToastContext.tsx';
import ToastContainer from './components/Toast/ToastContainer.tsx';

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
     <ToastProvider>
    <App />
    <ToastContainer />
    </ToastProvider>
    </Provider>,
);
