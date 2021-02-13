<template>
  <div>
    <div class="columns is-multiline">
      <div class="column is-half is-offset-one-quarter has-text-centered">
        The event's question is <b>{{ question }}</b> and your vote is wanted!
        <!-- TODO only those who have been pre-approved can vote? i.e friends or list of emails -->
        <p v-if="isExpired">
          This event's voting deadline has passed! You can view the result at
          this
          <router-link :to="resultUrl">link.</router-link>
        </p>
        <div v-else>
          <p v-if="canWriteCustom">
            This event allows you to vote for a choice you write!<br /><br />
          </p>
          <p v-if="votingMethod === 'Single Vote'">
            You can only vote for 1 choice.
          </p>
          <p v-else-if="votingMethod === 'Multiple Votes'">
            You can vote for as many choices as you want.
          </p>
          <p v-else>
            You can vote for as many choices as you want. You can rank your
            votes by clicking them in the order you like!
          </p>
        </div>
        <section class="mt-4" v-if="!isExpired">
          <b-field grouped group-multiline :disabled="isVoteDone">
            <b-taglist
              class="control"
              attached
              v-for="answer in answers"
              :key="answer"
              :class="{
                'is-clickable': !isVoteDone,
                'is-not-allowed': isVoteDone,
              }"
            >
              <b-tooltip label="Add a time to your vote.">
                <b-tag
                  rounded
                  @click.native="addTime(answer)"
                  class="p-4 not-rounded-right"
                  size="is-medium"
                  ><b-icon icon="calendar-plus"></b-icon
                ></b-tag>
                <!-- <b-tag
                @click.native="addLocation(answer)"
                class="p-3"
                size="is-medium"
                ><b-icon icon="map-marker-plus"></b-icon
              ></b-tag>
              <b-tag
                @click.native="addPeople(answer)"
                class="p-3"
                size="is-medium"
                ><b-icon icon="account-plus"></b-icon
              ></b-tag> -->
              </b-tooltip>
              <b-tag class="divider-left" size="is-medium"></b-tag>
              <b-tag
                rounded
                :type="chosen.includes(answer) ? 'is-success' : ''"
                @click.native="toggleAnswer(answer)"
                size="is-medium"
                >{{ answer }}</b-tag
              >
            </b-taglist>
          </b-field>
          <b-input
            v-if="canWriteCustom"
            v-model="custom"
            placeholder="you can write your custom answer here"
            @input="customInput"
          ></b-input>
          <b-collapse :open="false" position="is-bottom" aria-id="moreOptions">
            <a slot="trigger" slot-scope="props" aria-controls="moreOptions">
              <b-icon :icon="!props.open ? 'menu-down' : 'menu-up'"></b-icon>
              {{ !props.open ? "Preview Vote" : "Close Preview" }}
            </a>
                <vue-json-pretty class="has-text-left" :data="this.chosen" @click="addLocation"> </vue-json-pretty> 
                <!-- TODO drag and drop, delete, move up move down -->
          </b-collapse>
        </section>
      </div>
    </div>
    <div class="columns is-multiline">
      <div
        class="column is-half is-offset-one-quarter has-text-centered"
        v-if="isAddingTime"
      >
        Adding time to {{ lastChosen }}
        <date-picker
          show-helper-buttons
          switch-button-label="Whole days?"
          :helper-buttons="helperButtons"
          :disabled-dates="disabledDates"
          :initial-dates="initialDates"
          @date-applied="dateApplied"
        ></date-picker>
      </div>
    </div>
    <div class="columns is-multiline">
      <div class="column is-offset-one-quarter is-half has-text-centered">
        <b-button
          class="is-primary mt-4"
          :class="{ 'is-loading': isVoteLoading }"
          @click="vote"
          >Vote</b-button
        >
      </div>
      <div class="column is-one-third is-offset-one-third">
        <b-notification
          v-if="isRankedVotingMessage"
          type="is-information"
          has-icon
          aria-close-label="Close notification"
          role="alert"
        >
          You have added your own choice to a ranked choice voting event. The rank of your custom choice is dependant on the order you wrote your custom choice.
        </b-notification>
      </div>
      <div class="column is-one-third is-offset-one-third">
        <b-notification
          v-if="voteNotification"
          :type="voteNotificationType"
          has-icon
          aria-close-label="Close notification"
          role="alert"
        >
          {{ voteMessage }}
        </b-notification>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import axios from "axios";
import DatePicker from "vue-time-date-range-picker/dist/vdprDatePicker";
import moment from "moment";
import VueJsonPretty from 'vue-json-pretty';
import "vue-json-pretty/lib/styles.css";

@Component({
  components: {
    DatePicker,
    VueJsonPretty
  },
})
export default class EventVote extends Vue {
  resultUrl = "/event/" + this.$route.params.id + "/result";
  votingMethod = "";
  canWriteCustom = false;
  isVoterAnonymous = true; // if some1 has an account, do they choose to vote as non-anon even if not required?
  isVoteChangeable = false;
  voteDeadline: Date | undefined;
  answers: string[] = [];
  question = "";
  chosen: string[] = [];
  chosenCustomIndex = -2;
  lastChosen = "";
  isAddingTime = false;
  isEventLoading = true;
  isVoteLoading = false;
  mustRankAll = false;
  custom = "";
  isExpired = false;
  isVoteDone = false;
  voteNotification = false;
  voteNotificationType = "";
  voteMessage = "";
  isRankedVotingMessage = false;
  helperButtons = [
    {
      name: "Today",
      from: moment().toDate(),
      to: moment().endOf("day").toDate(),
    },
    {
      name: "Tomorrow",
      from: moment().add(1, "days").startOf("day").toDate(),
      to: moment().add(1, "days").endOf("day").toDate(),
    },
    {
      name: "48 Hours",
      from: moment().toDate(),
      to: moment().add(48, "hours").toDate(),
    },
    {
      name: "Weekend",
      from: moment().weekday(5).startOf("day").toDate(),
      to: moment().weekday(6).endOf("day").toDate(),
    },
    {
      name: "To end of Week",
      from: moment().toDate(),
      to: moment().endOf("week").endOf("day").toDate(),
    },
    {
      name: "To end of Month",
      from: moment().toDate(),
      to: moment().endOf("month").endOf("day").toDate(),
    },
    {
      name: "One Week",
      from: moment().toDate(),
      to: moment().add(1, "week").toDate(),
    },
    {
      name: "One Month",
      from: moment().toDate(),
      to: moment().add(1, "month").toDate(),
    },
  ];
  disabledDates = {
    custom(date: any) {
      return moment(date).isBefore(moment().subtract(1, "days"));
    },
  };
  initialDates = [moment().toDate(), moment().add(1, "days").toDate()];

  customInput() {
    const isCustom = this.custom === "" ? false : true;
    if (isCustom === true) {
      if (this.votingMethod === "Single Vote") {
        this.chosen = [];
      }
      if (this.chosenCustomIndex === -2) {
        this.chosenCustomIndex = this.chosen.length;
      }
      this.chosen.splice(this.chosenCustomIndex, 1, this.custom);
    } else {
      this.chosen.splice(this.chosenCustomIndex, 1);
      this.chosenCustomIndex = -2;
    }    
  }

  dateApplied(start: Date, end: Date) {
    // TODO make each answer has sub array of times, push to this array
    this.isAddingTime = false;
    this.lastChosen = "";
  }

  addTime(val: string) {
    this.lastChosen = val;
    this.isAddingTime = true;
  }
  addLocation(path: any, val: string) {
    console.log(path);    
    console.log("adding location " + val);
  }
  // addPeople(val: string) {
  //   console.log("adding people " + val);
  // }

  toggleAnswer(answer: string) {
    if (this.isVoteDone) {
      return;
    }
    if (this.chosen.length === 1 && this.votingMethod === "Single Vote") {
      if (answer !== this.chosen[0]) {
        this.chosen = [];
        this.custom = "";
        this.chosenCustomIndex = -2;
      }
    }
    const index = this.chosen.indexOf(answer);
    if (index === this.chosenCustomIndex) {
      this.custom = "";
      this.chosenCustomIndex = -2;
      return;
    }
    if (index === -1) {
      this.chosen.push(answer);
    } else {
      this.chosen.splice(index, 1);
    }
  }

  vote() {
    this.voteNotification = false;
    if (
      this.chosen.length === 0 ||
      (this.chosen.length === 1 && this.chosen[0] === "")
    ) {
      this.voteMessage = "Please provide at least 1 choice before voting.";
      this.voteNotificationType = "is-danger";
      this.voteNotification = true;
      return;
    }
    if (this.votingMethod === "Ranked Voting" && this.mustRankAll) {
      const didRankAll = this.answers.every((val) => this.chosen.includes(val));
      if (!didRankAll) {
        this.voteMessage =
          "This event requires that you rank all of the available choices.";
        this.voteNotificationType = "is-danger";
        this.voteNotification = true;
        return;
      }
    }
    if (this.chosenCustomIndex !== -1) {
      // avoid adding duplicates if user's custom choice already selected
      if (this.chosen.indexOf(this.custom) === -1) {
        this.chosen.splice(this.chosenCustomIndex, 0, this.custom);
      }
    }
    if (
      this.chosen.length !== 1 &&
      this.custom !== "" &&
      this.votingMethod === "Ranked Voting"
    ) {
      this.isRankedVotingMessage = true;
    }
    this.isVoteLoading = true;
    const data = {
      votes: this.chosen,
      voter_username: "username_placeholder",
      voter_email: "email placeHOL><:DER!",
    };
    axios
      .post(
        process.env.VUE_APP_BACKEND_API_BASE_URL + "event/" + this.$route.params.id + "/vote",
        data
      )
      .then((response) => {
        console.log(response);
        this.isVoteLoading = false;
        this.isVoteDone = true;
        this.voteMessage = "Successfully submitted your vote.";
        this.voteNotificationType = "is-success";
        this.voteNotification = true;
      })
      .catch((error) => {
        this.voteMessage = "Failed to submit your vote.";
        this.voteNotificationType = "is-danger";
        this.voteNotification = true;
        console.log(error);
      });
  }

  created() {
    if (this.isEventLoading) {
      axios
        .get(process.env.VUE_APP_BACKEND_API_BASE_URL + "event/" + this.$route.params.id)
        .then((response) => {
          const data = response.data;
          this.isEventLoading = false;
          this.votingMethod = data.voting_method;
          this.canWriteCustom = data.can_write_custom;
          this.isVoterAnonymous = data.is_voter_anonymous;
          this.isVoteChangeable = data.is_vote_changeable;
          this.voteDeadline = data.voting_deadline;
          this.answers = data.answers;
          this.question = data.question;
          this.mustRankAll = data.must_rank_all;
          if (this.voteDeadline! < new Date()) {
            this.isExpired = true;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
}
</script>

<style scoped>
.is-not-allowed {
  cursor: not-allowed;
}
.divider-left {
  border-left: 2px solid#272727;
  padding-left: 0.2rem !important;
  padding-right: 0 !important;
  margin-right: -0.2rem !important;
}
.not-rounded-right {
  border-top-right-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}
</style>
