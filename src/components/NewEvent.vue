<template>
      <b-steps
        v-model="activeStep"
        label-position="bottom"
        mobile-mode="compact"
        :has-navigation="false"
        :destroy-on-hide="true"
      >
        <b-step-item step="1" label="Question" :clickable="false">
          <h1 class="title has-text-centered">Ask a question</h1>
          <event-question @done="nextStep" />
        </b-step-item>

        <b-step-item step="2" label="Answers" :clickable="false">
          <h1 class="title has-text-centered">Answers</h1>
          <event-answers @done="nextStep" />
        </b-step-item>

        <b-step-item step="3" label="Options" :clickable="false">
          <h1 class="title has-text-centered">Options</h1>
          <event-options @done="nextStep" />
        </b-step-item>
<!-- TODO after user passes create event, it should not be permissble to go back to previous steps, but before that it should be permisslbe -->
        <b-step-item step="4" label="Share" :clickable="false">
          <h1 class="title has-text-centered">Share</h1>
          <share-event @done="nextStep" />
        </b-step-item>

        <b-step-item step="5" label="Result" :clickable="false">
          <h1 class="title has-text-centered">Result</h1>
          <event-result />
        </b-step-item>
      </b-steps>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import EventOptions from "@/components/EventOptions.vue";
import ShareEvent from "@/components/ShareEvent.vue";
import EventAnswers from "@/components/EventAnswers.vue";
import EventQuestion from "@/components/EventQuestion.vue";
import EventResult from "@/components/EventResult.vue";

@Component({
  components: {
    EventQuestion,
    EventAnswers,
    EventOptions,
    ShareEvent,
    EventResult,
  },
})
export default class NewEvent extends Vue {
  question = "";
  activeStep = 0;
  isNewEvent = true;
  isNewEventOptions = [
    { text: "New Event", value: true },
    { text: "Existing Event", value: false },
  ];
  nextStep() {
    this.activeStep++;
    // TODO make next item in focus
  }
}
</script>
