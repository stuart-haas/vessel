import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Aura from '@primeuix/themes/aura';
import FocusTrap from 'primevue/focustrap';
import 'primeicons/primeicons.css';

const app = createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: 'none',
    }
  }
});
app.use(ToastService);
app.directive('focustrap', FocusTrap);
app.mount('#app');
