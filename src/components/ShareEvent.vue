<template>
  <div class="has-text-centered">
    <div class="share-network-list">
      <ShareNetwork
        v-for="network in networks"
        :network="network.network"
        :key="network.network"
        :style="{ backgroundColor: network.color }"
        :url="sharing.url"
        :title="sharing.title"
        :description="sharing.description"
      >
        <i><b-icon :icon="network.icon"></b-icon></i>
        <span>{{ network.name }}</span>
      </ShareNetwork>
      <div class="imitate-share-network" @click="copy">
        <i><b-icon icon="clipboard-outline"></b-icon></i>
        <span> Copy to Clipboard </span>
      </div>
    </div>
    <div class="columns is-centered">
      <div class="column is-half">
        <b-notification
          v-if="copyNotification"
          :type="copyNotificationType"
          has-icon
          aria-close-label="Close notification"
          role="alert"
        >
          {{ copyMessage }}
        </b-notification>
      </div>
    </div>
    <b-button rounded class="is-primary" @click="done">Done</b-button>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class ShareEvent extends Vue {
  copyNotification = false;
  copyMessage = "";
  copyNotificationType = "";
  sharing = {
    url: "",
    title: "",
    description: "",
  };
  networks = [
    {
      network: "email",
      name: "Email",
      icon: "email",
    },
    {
      network: "facebook",
      name: "Facebook",
      icon: "facebook",
      color: "#1877f2",
    },
    {
      network: "reddit",
      name: "Reddit",
      icon: "reddit",
      color: "#ff4500",
    },
    {
      network: "telegram",
      name: "Telegram",
      icon: "telegram",
      color: "#0088cc",
    },
    {
      network: "twitter",
      name: "Twitter",
      icon: "twitter",
      color: "#1da1f2",
    },
    {
      network: "whatsapp",
      name: "Whatsapp",
      icon: "whatsapp",
      color: "#25d366",
    },
  ];
  copy() {
    this.copyNotification = false;
    this.$copyText(this.sharing.url).then(
      () => {
        this.copyNotification = true;
        this.copyMessage = "Successfully copied to clipboard.";
        this.copyNotificationType = "is-success";
      },
      (e) => {
        this.copyNotification = true;
        this.copyMessage = "Failed to copy to clipboard.";
        this.copyNotificationType = "is-danger";
        console.log(e);
      }
    );
  }
  done() {
    this.$emit("done");
  }
  created() {
    this.sharing = {
      url:
        window.location.origin +
        "/event/" +
        this.$store.state.eventId +
        "/vote",
      title: "DoWhatWhen:" + this.$store.state.question,
      description: "Choose what you want to do as a group!",
    };
  }
}
</script>

<style scoped>
.imitate-share-network {
  flex: none;
  color: #ffffff !important;
  background-color: #393939;
  border-radius: 3px;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-content: center;
  align-items: center;
  cursor: pointer;
  margin: 0 10px 10px 0;
}
.imitate-share-network i {
  background-color: rgba(0, 0, 0, 0.15);
  padding: 10px;
  flex: 0 1 auto;
}
.imitate-share-network span {
  padding: 10px;
  flex: 1 1 0%;
  font-weight: 500;
}
.share-network-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  max-width: 1000px;
  margin: auto;
}
a[class^="share-network-"] {
  flex: none;
  color: #ffffff;
  background-color: #444;
  border-radius: 3px;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-content: center;
  align-items: center;
  cursor: pointer;
  margin: 0 10px 10px 0;
}
a[class^="share-network-"] span {
  padding: 10px;
  flex: 1 1 0%;
  font-weight: 500;
}
a[class^="share-network-"] i {
  background-color: rgba(0, 0, 0, 0.15);
  padding: 10px;
  flex: 0 1 auto;
}
</style>
