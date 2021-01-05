<template>
  <div id="new-event">
    <section>
      <!-- <div class="block">
        <b-field grouped group-multiline>
          <b-field label="New or existing poll?">
            <b-select v-model="isNewPoll" @change.native="changePoll">
              <option
                v-for="option in isNewPollOptions"
                :value="option.value"
                :key="option.text"
              >
                {{ option.text }}
              </option>
            </b-select>
          </b-field>
        </b-field>
      </div> -->
      <b-steps
        v-model="activeStep"
        label-position="bottom"
        mobile-mode="compact"
        :has-navigation="false"
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
    </section>
  </div>
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
  // isNewPoll = true;
  // isNewPollOptions = [
  //   { text: "New Poll", value: true },
  //   { text: "Existing Poll", value: false },
  // ];
  // changePoll() {
  //   if (this.isNewPoll) {
  //     this.activeStep = 0;
  //   } else {
  //     if (this.$store.state.pollId != "0") {
  //       this.$buefy.dialog.confirm({
  //         title: "Switch Poll?",
  //         message:
  //           "Are you sure you want to <b>switch to</b> another poll? The existing poll can be revisited using the same ID: " +
  //           this.$store.state.pollId,
  //         confirmText: "Switch Poll",
  //         cancelText: "Cancel",
  //         type: "is-info",
  //         hasIcon: true,
  //         onCancel: () => {
  //           return;
  //         },
  //       });
  //     }
  //     this.$store.commit("setPollId", "0");
  //     this.activeStep = 2;
  //   }
  // }
  nextStep() {
    this.activeStep++;
  }
}
</script>
