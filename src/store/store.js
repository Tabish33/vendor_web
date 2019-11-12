import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

import router from ".././router";
import firebase_helper from "./modules/firebase";

export const store = new Vuex.Store({
  modules:{
    firebase_helper
  },

  getters:{
    getPrimaryColor(){
      return "#008577";
    }
  }
})