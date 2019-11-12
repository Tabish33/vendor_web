<template>
  <v-layout style="background: #fbfbfb;">
    <!-- BACKGROUND -->
    <v-flex class="pl-5 basic" md6>
      <img :src="image" width="762px" height="auto" alt />
    </v-flex>
    <!-- SIGN IN OR UP -->

    <v-flex>
      <v-layout fill-height justify-center align-content-center>
        <v-card style="margin:auto" width="350" class="card pa-4">
          <v-layout column>
            <v-flex>
              <v-btn
                class="capitalize bold larger"
                block
                color="white"
                @click="sign_in_dialog=true"
              >Sign In</v-btn>
            </v-flex>
            <v-flex>
              <v-btn
                @click="sign_up_dialog=true"
                class="capitalize bold larger"
                block
                color="rgb(23, 43, 77)"
                style="color:white"
              >Sign Up</v-btn>
            </v-flex>
          </v-layout>
        </v-card>
      </v-layout>
    </v-flex>
    <!-- DIALOGS -->
    <v-layout v-show="false">
      <!-- SIGN IN DIALOG -->
      <v-dialog v-model="sign_in_dialog" width="350">
        <v-card class="card pa-4" width="350">
          <v-form @submit.prevent="login" class="text-xs-center">
            <p style="color:red;">{{message}}</p>
            <v-text-field
              v-model="sign_in_email"
              autocomplete="new-password"
              v-validate="'required|email'"
              :error-messages="errors.collect('Sign In Email')"
              data-vv-name="Sign In Email"
              label="E-mail"
              type="email"
              prepend-icon="email"
            ></v-text-field>
            <v-text-field
              autocomplete="new-password"
              v-model="sign_in_password"
              v-validate="'required|min:6'"
              :error-messages="errors.collect('Sign In Password')"
              data-vv-name="Sign In Password"
              label="Password"
              type="password"
              prepend-icon="vpn_key"
            ></v-text-field>
            <v-btn
              :loading="loading"
              :disabled="loading"
              class="capitalize bold larger"
              block
              color="rgb(23, 43, 77)"
              style="color:white"
              large
              type="submit"
            >Sign In</v-btn>
          </v-form>
        </v-card>
      </v-dialog>
      <!-- SIGN UP DIALOG -->
      <v-dialog v-model="sign_up_dialog" width="350">
        <v-card class="card pa-4" width="350">
          <v-form @submit.prevent="signup" class="text-xs-center">
            <v-text-field
              v-model="restaurant_name"
              autocomplete="new-password"
              label="Restaurant Name"
              v-validate="'required'"
              :error-messages="errors.collect('Restaurant Name')"
              data-vv-name="Restaurant Name"
              required
              type="text"
              prepend-icon="account_circle"
            ></v-text-field>
            <v-text-field
              v-model="sign_up_email"
              autocomplete="new-password"
              v-validate="'required|email'"
              :error-messages="errors.collect('Sign Up Email')"
              data-vv-name="Sign Up Email"
              label="E-mail"
              required
              type="email"
              prepend-icon="email"
            ></v-text-field>
            <v-text-field
              v-model="sign_up_password"
              autocomplete="new-password"
              v-validate="'required|min:6'"
              :error-messages="errors.collect('Sign Up Password')"
              data-vv-name="Sign Up Password"
              label="Password"
              required
              type="password"
              prepend-icon="vpn_key"
            ></v-text-field>

            <v-btn
              :loading="loading"
              :disabled="loading"
              class="capitalize bold larger"
              block
              style="color:white"
              color="rgb(23, 43, 77)"
              type="submit"
            >Sign Up</v-btn>
          </v-form>
        </v-card>
      </v-dialog>
    </v-layout>
  </v-layout>
</template>

<script>
import { bus } from "../../main.js";
import { db, storeDb } from "@/components/firebase/init";
import firebase from "firebase";

import idb from "idb";

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
  data() {
    return {
      image: require("@/assets/mainbg.png"),
      sign_in_dialog: false,
      sign_up_dialog: false,

      restaurant_name: null,
      sign_up_email: null,
      sign_up_password: null,
      sign_up_loader: null,
      sign_up_loading: false,

      sign_in_password: null,
      sign_in_email: null,
      loader: null,
      loading: false,

      message: null
    };
  },
  methods: {
    closeLoader() {
      const l = this.loader;
      this[l] = !this[l];
      this.loader = null;
    },

    async login() {
      let email_validated = await this.$validator.validate(
        "Restaurant Name",
        this.sign_in_email
      );

      let password_validated = await this.$validator.validate(
        "Sign In Password",
        this.sign_in_password
      );

      if (email_validated && password_validated) {
        this.loader = "loading";

        firebase
          .auth()
          .signInWithEmailAndPassword(this.sign_in_email, this.sign_in_password)
          .then(user => {
            this.$router.push({ name: "Home" });
            this.closeLoader();
            this.$store.commit("saveUid", user.id);
          })
          .catch(err => {
            this.closeLoader();
            this.message = err.message;
          });
      }
    },

    async signup() {
      let name_validated = await this.$validator.validate(
        "Restaurant Name",
        this.restaurant_name
      );

      let email_validated = await this.$validator.validate(
        "Sign Up Email",
        this.sign_up_email
      );

      let password_validated = await this.$validator.validate(
        "Sign Up Password",
        this.sign_up_password
      );

      if (name_validated && email_validated && password_validated) {
        firebase
          .auth()
          .createUserWithEmailAndPassword(
            this.sign_up_email,
            this.sign_up_password
          )
          .then(cred => {
            storeDb
              .collection("businesses")
              .doc(cred.user.uid)
              .collection("account_details")
              .doc("details")
              .set({ name: this.restaurant_name, user_id: cred.user.uid })
              .then(async () => {
                await storeDb
                  .collection(`businesses/`)
                  .doc(`${firebase.auth().currentUser.uid}`)
                  .set({ temp: "temp" });

                this.closeLoader();
                this.$store.commit("saveUid", cred.user.uid);
                this.$store.commit("setSignUpStatus", false);
                this.$router.push({ name: "AccountSetup" });
              })
              .catch(err => {
                this.closeLoader();
                this.message = err.message;
              });
          });
      }
    }
  },

  watch: {
    loader() {
      const l = this.loader;
      this[l] = !this[l];
    }
  },

  mounted() {
    this.enter = true;
  },

  created() {
    
  }
};
</script>

<style scoped>
.main {
  background: #136a8a; /* fallback for old browsers */
  background: -webkit-linear-gradient(
    to right,
    #267871,
    #136a8a
  ); /* Chrome 10-25, Safari 5.1-6 */
  background: linear-gradient(
    to right,
    #267871,
    #136a8a
  ); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}

.basic {
  font-size: x-large;
  font-weight: bold;
}
</style>

