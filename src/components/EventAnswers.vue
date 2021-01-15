<template>
  <div>
    <b-field label="Let users write their own answers?">
      <b-switch v-model="canWriteCustom" true-value="Yes" false-value="No">
        {{ canWriteCustom }}
      </b-switch></b-field
    >
    <div>
      Answers:
      <b-field>
        <b-input
          v-model="answer"
          @keydown.enter.native.exact="add"
          @keydown.ctrl.enter.native.exact="done"
          id="focuselement"
        ></b-input>
        <b-button class="left-margin-small" @click="add">Add</b-button>
      </b-field>
      <div class="field">
        <b-tag
          v-for="answer in answers"
          :key="answer"
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
    <b-field class="has-text-centered top-margin-tiny">
      <b-button class="is-primary" rounded @click="done"
        >Save</b-button
      ></b-field
    >
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class EventAnswers extends Vue {
  canWriteCustom = "No";
  answers: string[] = [];
  answer = "";
  remove(str: string) {
    this.answers = this.answers.filter((e) => e !== str);
  }
  add() {
    if (!this.answer) {
      this.$buefy.toast.open({
        message: "Please write an answer!",
        type: "is-danger",
      });
      return;
    }
    this.answers.indexOf(this.answer) === -1
      ? this.answers.push(this.answer)
      : this.$buefy.toast.open({
          message: "Answer already added!",
          type: "is-danger",
        });
    this.answer = "";
  }
  done() {
    if (this.canWriteCustom === "No" && this.answers.length < 2) {
      this.$buefy.toast.open({
        message:
          "Please provide at least 2 choices or let users write their own!",
        type: "is-danger",
      });
      return;
    }
    this.$store.commit("setAnswers", {
      canWriteCustom: this.canWriteCustom,
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

<style scoped>
.top-margin-tiny {
  margin-top: 0.3em;
}
.left-margin-small {
  margin-left: 1em;
}
.tag {
  margin-right: 1em;
}
</style>
