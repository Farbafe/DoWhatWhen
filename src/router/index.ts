import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/Home.vue";
import EventVote from "../components/EventVote.vue";
import EventResult from "../components/EventResult.vue";
import User from "../components/User.vue";
import NotFound from "../components/NotFound.vue";

Vue.use(VueRouter);

const routes: Array<RouteConfig> = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/event/:id/vote",
    name: "EventVote",
    component: EventVote
  },
  {
    path: "/event/:id/result",
    name: "EventResult",
    component: EventResult
  },
  {
    path: "/user",
    name: "User",
    component: User
  },
  {
    path: "*",
    component: NotFound
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
