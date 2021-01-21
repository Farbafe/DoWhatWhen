<template>
  <div>
    <b-field :type="{ 'is-danger': isDanger }" :message="message">
      <b-input
        @keydown.enter.native.exact="done"
        v-model="question"
        ref="question"
        @input="inputChanged"
      ></b-input>
    </b-field>
    <br />
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
  isDanger = false;
  message = "";
  inputChanged() {
    if (this.question) {
      this.isDanger = false;
      this.message = "";
    } else {
      this.isDanger = true;
      this.message = "Please enter a question first.";
      return 1;
    }
  }
  done() {
    if (this.inputChanged() === 1) {
      return;
    }
    this.$store.commit("setQuestion", this.question);
    this.$emit("done");
  }
  mounted() {
    const ref: any = this.$refs.question;
    ref.focus();
  }
}
</script>
