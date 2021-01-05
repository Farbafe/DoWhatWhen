import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import { library } from '@fortawesome/fontawesome-svg-core'
import { faEnvelope, faClipboard } from '@fortawesome/free-solid-svg-icons'
import { faFacebook, faTwitter, faReddit, faWhatsapp, faTelegram, faRedditAlien, faTelegramPlane } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(faEnvelope);
library.add(faClipboard);
library.add(faFacebook);
library.add(faTwitter);
library.add(faReddit);
library.add(faRedditAlien);
library.add(faWhatsapp);
library.add(faTelegram);
library.add(faTelegramPlane);

Vue.component('font-awesome-icon', FontAwesomeIcon)

import "@mdi/font/css/materialdesignicons.css";

// import mdiFacebook from "vue-material-design-icons/Facebook.vue";
// import mdiReddit from "vue-material-design-icons/Reddit.vue";
// import mdiEmail from "vue-material-design-icons/Email.vue";
// import mdiTelegram from "vue-material-design-icons/Facebook.vue";
// import mdiTwitter from "vue-material-design-icons/Reddit.vue";
// import mdiWhatsapp from "vue-material-design-icons/Email.vue";
 
// Vue.component("facebook", mdiFacebook);
// Vue.component("reddit", mdiReddit);
// Vue.component("email", mdiEmail);
// Vue.component("telegram", mdiTelegram);
// Vue.component("twitter", mdiTwitter);
// Vue.component("whatsapp", mdiWhatsapp);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
