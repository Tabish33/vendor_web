import Vue from "vue";
import Router from "vue-router";

const SignUpOrLogin = () => import("@/components/auth/SignUpOrLogin");
const Home = () => import("@/components/Account/Home");

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: "/",
      name: "SignUpOrLogin",
      component: SignUpOrLogin
    },
    {
      path: "/home",
      name: "Home",
      component: Home
    },
  ]
});
