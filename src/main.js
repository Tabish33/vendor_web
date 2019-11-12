// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import VeeValidate from "vee-validate";
import App from "./App";
import router from "./router";
import "@/components/firebase/init";
import { store } from "@/store/store";
import Vuetify from "vuetify";
import VueFire from "vuefire";
import "vuetify/dist/vuetify.min.css";
import firebase from "firebase";
// import { RecycleScroller } from "vue-virtual-scroller";

export const bus = new Vue();

// Vue.component("RecycleScroller", RecycleScroller);
Vue.use(VeeValidate);
Vue.use(Vuetify);
Vue.use(VueFire);

Vue.config.productionTip = false;

const unsubscribe = firebase.auth().onAuthStateChanged(user => {
  /* eslint-disable no-new */

  const app = new Vue({
    store: store,
    el: "#app",
    router,
    components: {
      App
    },
    template: "<App/>"
  });
  unsubscribe();
});
