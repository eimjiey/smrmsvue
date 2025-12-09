// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import './assets/main.css';
import router from './router';

import { OhVueIcon, addIcons } from 'oh-vue-icons';
import {
  LaBarsSolid,
  MdFeaturedplaylistTwotone,
  MdAddboxTwotone,
  MdPeopleTwotone,
  MdInfoTwotone,
  MdLogoutOutlined,
  MdDashboardTwotone,
  MdRestorefromtrashTwotone,
  BiSearch
  
} from 'oh-vue-icons/icons';

addIcons(
  LaBarsSolid,
  MdFeaturedplaylistTwotone,
  MdAddboxTwotone,
  MdPeopleTwotone,
  MdInfoTwotone,
  MdLogoutOutlined,
  MdDashboardTwotone,
  MdRestorefromtrashTwotone,
  BiSearch
);

// 2. Create app ONCE
const app = createApp(App);

// 3. Register global components/plugins BEFORE mount
app.component('v-icon', OhVueIcon);
app.use(router);

// 4. Mount ONCE
app.mount('#app');
