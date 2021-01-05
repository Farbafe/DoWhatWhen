<template>
  <div id="app">
    <div id="nav" class="columns is-centered">
      <b-navbar class="column is-half">
        <template slot="brand">
          <router-link to="/"
            ><img
              class="logo"
              src="https://cdn.shopify.com/shopifycloud/hatchful-web/assets/6fcc76cfd1c59f44d43a485167fb3139.png" /></router-link
        ></template>
        <template slot="start">
          <b-navbar-item>
            <router-link to="/">Home</router-link>
          </b-navbar-item>
          <b-navbar-item>
            <router-link to="/about">About</router-link>
          </b-navbar-item>
        </template>
        <template slot="end">
          <b-navbar-item>
            <router-link to="/">Github</router-link>
          </b-navbar-item>
          <b-navbar-item>
            <router-link to="/about">Login</router-link>
          </b-navbar-item>
        </template>
      </b-navbar>
    </div>
    <router-view />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Buefy from "buefy";
import "buefy/dist/buefy.css";
import VueSocialSharing from "vue-social-sharing";
import VueMeta from "vue-meta";
import VueClipboard from "vue-clipboard2";

Vue.use(VueClipboard);
Vue.use(VueMeta);
Vue.use(VueSocialSharing);
Vue.use(Buefy);

export default {
  metaInfo() {
    return {
      title: "DoWhatWhen",
      meta: [
        {
          name: "description",
          content:
            "Decide where you are going to eat and who's coming without confusion or stress!",
        },
        {
          property: "og:title",
          content: "DoWhatWhen - Decide what to do and when as a group!",
        },
        { property: "og:site_name", content: "DoWhatWhen" },
        { property: "og:type", content: "website" },
        { name: "robots", content: "index,follow" },
      ],
    };
  },
};
</script>

<style scoped>
.logo {
  width: 25%;
}
</style>
