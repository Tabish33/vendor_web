import firebase from "firebase";
import firestore from "firebase/firestore";

var config = {
  apiKey: "AIzaSyDmZ5xBbR4NEiDzY_fa8UAQXSe4-VHj3UA",
  authDomain: "posbfirackend-7b0d0.firebaseapp.com",
  databaseURL: "https://posbackend-7b0d0.firebaseio.com",
  projectId: "posbackend-7b0d0",
  storageBucket: "posbackend-7b0d0.appspot.com",
  messagingSenderId: "999998154064"
};

// var config = {
//   apiKey: "AIzaSyAJfrPPHEle4zvAL4Ae_IQfMTJyTbpbmzc",
//   authDomain: "testing-account-6b4ba.firebaseapp.com",
//   databaseURL: "https://testing-account-6b4ba.firebaseio.com",
//   projectId: "testing-account-6b4ba",
//   storageBucket: "testing-account-6b4ba.appspot.com",
//   messagingSenderId: "102452522933",
//   appId: "1:102452522933:web:f262f9994d6d42fc"
// };

const app = firebase.initializeApp(config);
const db = app.database();
const storeDb = app.firestore();

export { db, storeDb };
