<template>
  <div class="columns is-centered">
    <div class="column is-one-third">
      The event's question is <b>{{ question }}</b> Please vote for your choice
      on the right!<br />
      <p v-if="isExpired">
        This event's voting deadline has passed! You can view the result at this
        <router-link :to="resultUrl">link.</router-link>
      </p>
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
        You can vote for as many choices as you want. You can rank your votes by
        clicking them in the order you like!
      </p>
    </div>
    <div class="column is-half" v-if="!isExpired">
      <fieldset :disabled="isVoteDone">
        <div class="field">
          <b-tag
            v-for="answer in answers"
            :key="answer"
            :type="chosen.includes(answer) ? 'is-success' : ''"
            rounded
            class="p-1 mr-3"
            size="is-medium"
            ><div
              :class="{
                'is-clickable': !isVoteDone,
                'is-not-allowed': isVoteDone,
              }"
              @click="toggleAnswer(answer)"
            >
              {{ answer }}
            </div></b-tag
          >
        </div>
        <b-input
          v-if="canWriteCustom"
          v-model="custom"
          placeholder="you can write your custom answer here"
          @input="customInput"
        ></b-input>
        <div class="columns is-centered">
          <div class="column is-half">
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
        <div class="has-text-centered">
          <b-button
            class="is-primary mt-4"
            :class="{ 'is-loading': isVoteLoading }"
            @click="vote"
            >Vote</b-button
          >
        </div>
      </fieldset>
    <br />
    <date-picker inline show-helper-buttons switch-button-label="Whole days?" :helper-buttons="helperButtons" :disabled-dates="disabledDates" :initial-dates="initialDates"></date-picker>
    </div>
    <!-- the id of this event is: {{ this.$route.params.id }}
    {{ votingMethod }} {{ canWriteCustom }} -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import axios from "axios";
import DatePicker from "vue-time-date-range-picker/dist/vdprDatePicker";
import moment from "moment";

@Component({
  components: {
    DatePicker,
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
  isEventLoading = true;
  isVoteLoading = false;
  mustRankAll = false;
  custom = "";
  isExpired = false;
  isVoteDone = false;
  voteNotification = false;
  voteNotificationType = "";
  voteMessage = "";
  helperButtons = [
    {
      "name": "Today",
      "from": moment().toDate(),
      "to": moment().endOf('day').toDate()
    },
    {
      "name": "Tomorrow",
      "from": moment().add(1, "days").startOf('day').toDate(),
      "to": moment().add(1, "days").endOf('day').toDate()
    },
    {
      "name": "48 Hours",
      "from": moment().toDate(),
      "to": moment().add(48, "hours").toDate()
    },
    {
      "name": "Weekend",
      "from": moment().weekday(5).toDate(),
      "to": moment().weekday(6).endOf('day').toDate()
    },
    {
      "name": "End of Week",
      "from": moment().toDate(),
      "to": moment().endOf('week').endOf('day').toDate()
    },
    {
      "name": "End of Month",
      "from": moment().toDate(),
      "to": moment().endOf('month').endOf('day').toDate()
    },
    {
      "name": "One Week",
      "from": moment().toDate(),
      "to": moment().add(1, "week").toDate()
    },
    {
      "name": "One Month",
      "from": moment().toDate(),
      "to": moment().add(1, "month").toDate()
    }
  ];
  disabledDates = {
    custom(date: any) {
      return moment(date).isBefore(moment().subtract(1, "days"));
    }
  };
  initialDates = [moment().toDate(), moment().add(1, "days").toDate()];

  customInput() {
    const index = this.chosen.indexOf("__CUSTOM__VOTING__INPUT");
    if (this.custom === "") {
      if (index !== -1) {
        this.chosen.splice(index, 1);
      }
    } else {
      if (index === -1) {
        this.chosen.push("__CUSTOM__VOTING__INPUT");
      }
      if (this.votingMethod === "Single Vote") {
        this.chosen = ["__CUSTOM__VOTING__INPUT"];
      }
    }
  }

  toggleAnswer(answer: string) {
    if (this.isVoteDone) {
      return;
    }
    if (this.chosen.length === 1 && this.votingMethod === "Single Vote") {
      if (answer !== this.chosen[0]) {
        this.chosen = [];
        this.custom = "";
      }
    }
    if (this.chosen.indexOf(answer) === -1) {
      this.chosen.push(answer);
    } else {
      this.chosen = this.chosen.filter((e) => e !== answer);
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
    const index = this.chosen.indexOf("__CUSTOM__VOTING__INPUT");
    if (index !== -1) {
      if (this.chosen.indexOf(this.custom) === -1) {
        // avoid adding duplicates if user's custom choice already selected
        this.chosen[index] = this.custom;
      } else {
        this.chosen.splice(index, 1);
      }
    }
    if (
      this.chosen.length !== 1 &&
      this.custom !== "" &&
      this.votingMethod === "Ranked Voting"
    ) {
      this.$buefy.dialog.alert(
        "You have added your own choice to a ranked choice voting event. The rank of your custom choice is dependant on the order you wrote your custom choice."
      );
    }
    this.isVoteLoading = true;
    const data = {
      "votes": this.chosen,
      "voter_username": "username_placeholder",
      "voter_email": "email placeHOL><:DER!",
    };
    axios
      .post(
        "http://127.0.0.1:8000/event/" + this.$route.params.id + "/vote",
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
        .get("http://127.0.0.1:8000/event/" + this.$route.params.id)
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
</style>
