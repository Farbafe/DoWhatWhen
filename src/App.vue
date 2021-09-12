<template>
  <div id="app">
    <section class="hero is-primary is-medium mb-2">
      <div class="hero-head">
        <nav class="navbar">
          <div class="container">
            <div class="navbar-menu">
              <div class="navbar-brand">
                <a href="/" class="navbar-item"
                  ><img src="./assets/logo.png"
                /></a>
              </div>
              <div class="navbar-end">
                <span class="navbar-item">
                  <router-link
                    to="/user"
                    class="button is-primary is-inverted"
                  >
                    <b-icon icon="account"></b-icon>
                    <span>Register/Login</span>
                  </router-link>
                </span>
                <span class="navbar-item">
                  <a
                    href="https://github.com/Farbafe/DoWhatWhen"
                    target="_blank"
                    class="button is-primary is-inverted"
                  >
                    <b-icon icon="github"></b-icon>
                    <span>Github</span>
                  </a>
                </span>
              </div>
            </div>
          </div>
        </nav>
      </div>
      <div class="hero-body">
        <div class="container has-text-centered">
          <h1 class="title">DoWhatWhen</h1>
          <h2 class="subtitle">
            Never spend another minute arguing what to eat.
          </h2>
        </div>
      </div>
      <!-- <div class="hero-foot">
        <nav class="tabs is-fullwidth">
          <div class="container pb-2">
            <ul>
              <li class="is-active">
                <a>We decided on what we want, but not when!</a>
              </li>
              <li><a>We know when but not what!</a></li>
              <li><a>We don't know anything!!!</a></li>
            </ul>
          </div>
        </nav>
      </div> -->
    </section>
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
      title: "DoWhatWhen - Decide what to do and when as a group",
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

<style scoped></style>
