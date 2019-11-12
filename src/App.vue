<template>
  <v-app style="background: white;">
    <v-content>
      <!-- DATA LOADING PROGRESS BAR   -->

      <router-view />
    </v-content>
  </v-app>
</template>

<script>
import { db, storeDb } from "./components/firebase/init";
import { bus } from "./main.js";
import firebase from "firebase";
import idb from "idb";
import moment from "moment";

const dbPromise = idb.open("pos-data-store", 1, upgradeDB => {
  upgradeDB.createObjectStore("keyval");
});

const idbKeyval = {
  get(key) {
    return dbPromise.then(db => {
      return db
        .transaction("keyval")
        .objectStore("keyval")
        .get(key);
    });
  },
  set(key, val) {
    return dbPromise.then(db => {
      const tx = db.transaction("keyval", "readwrite");
      tx.objectStore("keyval").put(val, key);
      return tx.complete;
    });
  }
};

export default {
  name: "App",

  data() {
    return {

    };
  },

  components: {

  },

  methods: {
    deepCopy(obj) {
      return JSON.parse(JSON.stringify(obj));
    },

    async startUp() {
      firebase.auth().onAuthStateChanged(async user => {

        if (user) {
          this.$store.commit("saveUid", user.uid);
          this.$router.push({ name: "Home" });
        } else {
          this.$router.push({ name: "SignUpOrLogin" });
        }
      });
    },
  },

  created() {
    
  }
};
</script>

<style>
* {
  font-family: "Lato", sans-serif;
}

p {
  user-select: none;
}

span {
  user-select: none;
}

::-webkit-scrollbar {
  width: 0px;
  height: 4px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

/* Handle */
::-webkit-scrollbar-thumb {
  border-radius: 5px;
  background: #888;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.capitalize {
  text-transform: capitalize;
}

hr {
  border: 0.4px solid #c8c7c7;
  background: #c8c7c7;
}

.v-bottom-sheet.v-dialog {
  transition: none !important;
}

.overflow_text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pointer {
  cursor: pointer;
}

.bold_grey_text {
  font-weight: 800;
  color: dimgrey;
  font-size: larger;
}

.card {
  border-radius: 8px !important;
  /* box-shadow: 1px 1px 8px lightgrey !important; */
  box-shadow: 1px 4px 2px lightgrey !important;
}

.bold {
  font-weight: bold;
}

.large {
  font-size: large;
}

.larger {
  font-size: larger;
}

.x_large {
  font-size: x-large;
}

.align_center{
  align-self: center;
}

.pointer {
  cursor: pointer;
}

.m_green{
  background-color:rgb(0, 133, 119);
}

.c_green{
  background-color: rgb(0, 150, 136);
}

.selected_color{
  background: rgb(255, 152, 0);
}

.custom_tab{
  border:1.5px solid grey;
  font-weight: bold;
  height: 40px;
  text-transform: capitalize;
  margin-left: 10px;
  margin-top: 6px;
  border-radius: 8px !important;
  box-shadow: 1px 1px 8px lightgrey !important;
}

.tab_selected{
  border:1.5px solid rgb(0, 133, 119);
}

.v-tabs-bar__content {
  flex-wrap: wrap;
  width: 100%;
}
div.v-tabs-bar {
  height: auto;
}
/* .v-text-field input {
  padding: 0;
} */
</style>
