<template>
  <div>
    <b-input @keydown.enter.native.exact="done" v-model="question"></b-input><br />
    <b-field class="has-text-centered">
      <b-button class="is-primary" rounded @click="done">Ask</b-button></b-field
    >
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class EventQuestion extends Vue {
  question = "";
  done() {
    if (!this.question) {
      this.$buefy.toast.open({
        message: "Please write a question!",
        type: "is-danger",
      });
      return;
    }
    this.$store.commit("setQuestion", this.question);
    this.$emit("done");
  }
}
</script>
