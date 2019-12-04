import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

import router from ".././router";
import firebase_helper from "./modules/firebase";
import moment from "moment"

export const store = new Vuex.Store({
  modules:{
    firebase_helper
  },

  state: {
    categories : ["Chicken", "Meat", "Spice", "Seafood", "Dry Fruit", "Dairy","Vegetable"],
    units: ["kg", "gm", "L", "ml", "pc"],
    type: ["VEG", "NONVEG"]
  },

  getters:{
    getPrimaryColor(){
      return "#008577";
    },

    getCategories(state){
      return state.categories;
    },

    getUnits(state) {
      return state.units;
    },

    getType(state) {
      return state.type;
    },

    getDate() {
      let date = moment(Date()).format("L");
      let new_date = date.replace("/", "-");
      new_date = new_date.replace("/", "-");

      return new_date;
    },
  }
})