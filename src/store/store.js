import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);
import { storeDb} from '../components/firebase/init'
import router from ".././router";
import firebase_helper from "./modules/firebase";
import moment from "moment"

export const store = new Vuex.Store({
  modules:{
    firebase_helper
  },

  state: {
    audio: new Audio(require('../assets/notf.mp3')),
    categories : ["Chicken", "Meat", "Spice", "Seafood", "Dry Fruit", "Dairy","Vegetable"],
    units: ["kg", "gm", "L", "ml", "pc"],
    type: ["VEG", "NONVEG"],
    pending_item_ids: {},
    pending_orders: []
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

    getPendingOrders(state){
      return state.pending_orders
    }
  },

  actions: {
    async loadConfirmedOrders({state}){
      console.log("runninh");
      
      storeDb.collection("vendor_orders")
        .where("status", "==", "confirmed")
        .onSnapshot(querySnap => {
          querySnap.forEach(doc => {
            let order = doc.data()

            if (!state.pending_item_ids[order.id] && order.status == "confirmed") {
              state.audio.play();
              state.pending_item_ids[order.id] = 1;
              state.pending_orders.splice(0,0,order)
            }
          })
        })
    },

    async markOrderAsOutForDelivery({state},order) {
      state.pending_orders = state.pending_orders.filter(ordr => {
        if (ordr.id == order.id) return false
        else return true
      })

      delete state.pending_item_ids[order.id]

      await storeDb.collection("vendor_orders")
        .doc(order.id.toString())
        .update({
          "status": "out_for_delivery"
        })
    
    },
  }
})