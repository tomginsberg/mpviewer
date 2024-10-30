import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { registerSW } from 'virtual:pwa-register';


const updateSW = registerSW({
    onNeedRefresh() {
        if (confirm('New content is available. Do you want to reload the app?')) {
            updateSW();
        }
    },
    onOfflineReady() {
        console.log('The app is ready to work offline.');
    }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
