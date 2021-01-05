<template>
  <div>
    <b-field label="Voting Method" horizontal>
      <b-radio
        v-for="method in voteMethods"
        v-model="voteMethod"
        :key="method"
        :native-value="method"
        >{{ method }}</b-radio
      ></b-field
    >
    <b-field label="Voting Deadline" horizontal>
      <b-datetimepicker
        editable
        v-model="voteDeadline"
        placeholder="voting deadline (optional)"
        icon="calendar-today"
        :min-datetime="new Date()"
        horizontal-time-picker
      >
      </b-datetimepicker>
    </b-field>
    <b-field label="Email" horizontal
      ><b-tooltip position="is-right" :triggers="['click', 'hover', 'focus']"
        ><template v-slot:content
          >We never share your email with anyone.</template
        >
        <b-input
          type="email"
          icon="email"
          v-model="email"
          placeholder="email (optional)"
          @keydown.enter.native.exact="done"
      /></b-tooltip>
    </b-field>
    <b-collapse :open="false" position="is-bottom" aria-id="moreOptions">
      <a slot="trigger" slot-scope="props" aria-controls="moreOptions">
        <b-icon :icon="!props.open ? 'menu-down' : 'menu-up'"></b-icon>
        {{ !props.open ? "All options" : "Fewer options" }}
      </a>
      <div class="field">
        <b-checkbox v-model="isVoterAnonymous">
          Voters are anonymous.</b-checkbox
        ><br />
        <b-checkbox v-model="isVoteChangeable">
          Voters can change their mind.</b-checkbox
        ><br />
        <b-checkbox v-model="isResultLive">
          Result can be seen before deadline.</b-checkbox
        ><br />
        <b-checkbox v-model="mustRankAll">
          All choices have to be ranked in ranked voting.</b-checkbox
        ><br />
        <b-checkbox v-model="isResultPublic">
          Everyone can see the result.</b-checkbox
        ><br />
        <b-checkbox v-model="isCustomAnswersAdded">
          User-provided answers are added to the choices of following users.</b-checkbox
        >
      </div>
      <!-- TODO only those who have been pre-approved can vote? i.e friends or list of emails -->
    </b-collapse>
    <b-field class="has-text-centered">
      <b-button
        class="is-primary"
        :class="{ 'is-loading': isLoading }"
        rounded
        @click="done"
        >Create Event</b-button
      ></b-field
    >
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class EventOptions extends Vue {
  always = false;
  email = "";
  voteDeadline = new Date();
  voteMethod = "Single Vote";
  voteMethods = ["Single Vote", "Ranked Voting", "Multiple Votes"];
  isVoterAnonymous = true;
  isVoteChangeable = false;
  isResultLive = false;
  mustRankAll = false;
  isResultPublic = true;
  isCustomAnswersAdded = false;
  isLoading = false;
  
  done() {
    this.isLoading = true;
    setTimeout(() => {
      // create new link every click, even if no options changed
      // throttle limit to some number in the backend
      // send email, voting method and question
      // also send answers and related options
      // get event id
      this.$store.commit("setEventId", "1250");
      this.isLoading = false;
      this.$emit("done");
    }, 900);
  }
}
</script>
