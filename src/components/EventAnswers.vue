<template>
  <div>
    <b-checkbox v-model="canWriteCustom"
      >Voters can write their own answers.</b-checkbox
    >
    <b-checkbox v-model="isCustomAnswersAdded" :disabled="!canWriteCustom">
      Voter-provided answers are added to the choices of following
      voters.</b-checkbox
    >
    <b-checkbox v-model="isVoteWhen">
      Voters must choose a time for their answers.</b-checkbox
    >
    <div>
      Answers:
      <b-field :message="message" :type="{ 'is-danger': isDanger }">
        <b-input
          v-model="answer"
          @keydown.enter.native.exact="add"
          @keydown.ctrl.enter.native.exact="done"
          @input="inputChanged(false)"
          id="focuselement"
        ></b-input>
        <b-button class="ml-4" @click="add" icon-left="plus">Add</b-button>
      </b-field>
      <div class="field">
        <b-tag
          v-for="answer in answers"
          :key="answer"
          class="mr-3"
          close-type="is-danger"
          closable
          close-icon="delete"
          rounded
          size="is-medium"
          @close="remove(answer)"
          >{{ answer }}</b-tag
        >
      </div>
    </div>
    <b-field class="has-text-centered mt-3">
      <b-button class="is-primary" rounded @click="done"
        >Submit</b-button
      ></b-field
    >
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class EventAnswers extends Vue {
  canWriteCustom = false;
  isCustomAnswersAdded = false;
  isVoteWhen = true;
  answers: string[] = [];
  answer = "";
  message = "";
  isDanger = false;
  remove(str: string) {
    this.answers = this.answers.filter((e) => e !== str);
  }
  inputChanged(adding: boolean) {
    if (!this.answer && adding) {
      this.isDanger = true;
      this.message = "Please write an answer first.";
      return 1;
    } else if (this.answers.indexOf(this.answer) !== -1) {
      this.isDanger = true;
      this.message = "This answer is already added.";
      return 1;
    }
    this.isDanger = false;
    this.message = "";
  }
  add() {
    if (this.inputChanged(true) === 1) {
      return;
    }
    this.answers.push(this.answer);
    this.answer = "";
  }
  done() {
    if (this.canWriteCustom === false && this.answers.length < 2) {
      this.isDanger = true;
      this.message =
        "Please provide at least 2 answers or let voters write their own.";
      return;
    }
    this.$store.commit("setAnswers", {
      canWriteCustom: this.canWriteCustom,
      isCustomAnswersAdded: this.isCustomAnswersAdded,
      isVoteWhen: this.isVoteWhen,
      answers: this.answers,
    });
    this.$emit("done");
  }
  visible(elem: any) {
    elem.focus();
  }
  mounted() {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const inViewport = require("in-viewport");
    const elem = document.getElementById("focuselement");
    inViewport(elem, this.visible);
  }
}
</script>

<style scoped></style>
