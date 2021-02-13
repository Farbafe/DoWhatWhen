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
          id="focuselement"
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
        <b-checkbox v-model="willEmailAdmin">
          Send me an email when voting deadline is reached.</b-checkbox
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
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

@Component
export default class EventOptions extends Vue {
  email = "";
  voteDeadline = new Date(new Date().getTime() + (24 * 60 * 60 * 1000));
  voteMethod = "Single Vote";
  voteMethods = ["Single Vote", "Ranked Voting", "Multiple Votes"];
  isVoterAnonymous = true;
  isVoteChangeable = false;
  isResultLive = true;
  mustRankAll = false;
  isResultPublic = false;
  isLoading = false;
  willEmailAdmin = true;

  done() {
    this.isLoading = true;
    this.$store.commit("setEmail", this.email);
    if (localStorage.getItem("eventAdminToken") === null) {
      localStorage.setItem("eventAdminToken", uuidv4());
    }
    const data = {
      "event": {// TODO these settings should be stored in localstorage so that
      // if the user changes them, he only has to change them once! store email too
        "question": this.$store.state.question,
        "admin_email": this.email,
        "admin_token": localStorage.getItem("eventAdminToken"),
        "can_write_custom": this.$store.state.canWriteCustom,
        "is_voter_anonymous": this.isVoterAnonymous,
        "is_vote_changeable": this.isVoteChangeable,
        "is_result_live": this.isResultLive,
        "must_rank_all": this.mustRankAll,
        "is_custom_answers_added": this.$store.state.isCustomAnswersAdded,
        "will_email_admin": this.willEmailAdmin,
        "voting_method": this.voteMethod,
        "voting_deadline": this.voteDeadline,
        "is_vote_when": this.$store.state.isVoteWhen // TODO get all store items and unpack once
      },
      "answers": this.$store.state.answers
    };
    axios.post(process.env.VUE_APP_BACKEND_API_BASE_URL + "event", JSON.stringify(data))
      .then((response) => {
        this.isLoading = false;
        this.$store.commit("setEventId", response.data.id);
        this.$emit("done");
      }).catch((error) => {
        console.log(error);
      });
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
