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
          You can add a date to your vote.<br />
          <p v-if="canWriteCustom">
            This event allows you to vote for a custom answer.<br />
          </p>
          <p v-if="votingMethod === 'Single Vote'">
            You can only vote for 1 choice.
          </p>
          <p v-else>
            You can vote for as many choices as you want.
            <span v-if="votingMethod === 'Ranked Voting'">
              You can rank yourvotes by clicking them in the order you like.
            </span>
          </p>
        </div>
        <b-field label="Username" horizontal class="mt-4"
          >
            <b-input
              icon="account"
              v-model="username"
              :placeholder="usernamePlaceholder"
              :required="!isVoterAnonymous"
          />
        </b-field>
        <b-field label="Email" horizontal
          ><b-tooltip position="is-right" :triggers="['click', 'hover', 'focus']" style="display: block;"
            ><template v-slot:content
              >We never share your email with anyone.</template
            >
            <b-input
              type="email"
              icon="email"
              v-model="email"
              placeholder="email (optional)"
          /></b-tooltip>
        </b-field>
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
                :type="chosenFindChoice(answer) !== -1 ? 'is-success' : ''"
                @click.native="toggleAnswer(answer)"
                size="is-medium"
                >{{ answer }}</b-tag
              >
            </b-taglist>
          </b-field>
          <div class="columns" v-if="canWriteCustom">
            <div class="column is-1 pt-4 m-1 pr-1 has-text-right">
              <b-icon icon="calendar-plus" class="is-clickable" @click.native="addTime(custom)"></b-icon>
            </div>
            <div class="column pl-1">
              <b-input
                v-model="custom"
                placeholder="you can write your custom answer here"
                @input="customInput"
                :class="{'is-disabled': this.isVoteLoading || this.isVoteDone}"
              ></b-input>
            </div>
          </div>
          <div
            class="column is-half is-offset-one-quarter has-text-centered"
            v-if="isAddingTime"
          >
            Adding time to <span class="has-text-weight-bold">{{ lastChosen }}</span>
            <date-picker
              show-helper-buttons
              switch-button-label="Whole days?"
              :helper-buttons="helperButtons"
              :disabled-dates="disabledDates"
              :initial-dates="initialDates"
              @date-applied="dateApplied"
              ref="datepickerAddDate"
            ></date-picker>
            <b-button class="is-primary mt-2" @click="dateAppliedWithoutDialog">Apply</b-button>
          </div>
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
      <div class="column is-offset-one-quarter is-half has-text-centered">
        <b-button
          class="is-primary mt-4"
          :class="{ 'is-loading': isVoteLoading}"
          :disabled="voteNotificationType === 'is-success'"
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
  usernamePlaceholder = "username";
  isVoteChangeable = false;
  voteDeadline = "";
  answers: string[] = [];
  question = "";
  username = "";
  email = "";
  chosen: Record<string, string | Record<string, string>[]>[] = [];
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
    const isCustom = this.custom !== "" ? true : false;
    if (isCustom === true) {      
      if (this.chosenCustomIndex === -2) {
        if (this.votingMethod === "Single Vote") {
          this.chosen = [];
        }
        this.chosenCustomIndex = this.chosen.length;
        this.chosen.push({"choice": "", "dates": []});
      }
      if (this.lastChosen !== this.chosen[this.chosenCustomIndex].choice) {
        this.isAddingTime = false;
      }
      this.chosen[this.chosenCustomIndex].choice = this.custom;
      this.lastChosen = this.custom;
    } else {
      this.chosen.splice(this.chosenCustomIndex, 1);
      this.chosenCustomIndex = -2;
      this.isAddingTime = false;
      this.lastChosen = "";
    }    
  }
  
  dateAppliedWithoutDialog() {
    let el = this.$refs.datepickerAddDate as Vue;
    let el2 = el.$children[0].$vnode.elm?.childNodes[0] as HTMLInputElement;
    let el3 = el2.value.toString().split(' - ')
    this.dateApplied(moment(el3[0], 'DD-MM-YYYY hh:mm').toDate(), moment(el3[1], 'DD-MM-YYYY hh:mm').toDate());
  }

  dateApplied(start: Date, end: Date) {
    if (start === end) {
      end = moment(end).add(1, 'd').toDate();
    }
    const index = this.chosenFindChoice(this.lastChosen);
    const date = {
      "start": start.toString(),
      "end": end.toString()
    };
    let dates = this.chosen[index].dates as Record<string, string>[];
    dates.push(date);
    this.isAddingTime = false;
    this.lastChosen = "";
  }

  addTime(val: string) {
    if (this.isVoteDone || this.isVoteLoading) {
      return;
    }
    if (this.chosenFindChoice(val) === -1) {
      this.toggleAnswer(val);
    }
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

  chosenFindChoice(answer: string) {
    let index = -1;
    for (let i = 0; i != this.chosen.length; ++i) {
      if (this.chosen[i].choice === answer) {
        index = i;
        break;
      }
    }
    return index;
  }

  toggleAnswer(answer: string) {
    if (this.isVoteDone || this.isVoteLoading) {
      return;
    }
    if (this.chosen.length === 1 && this.votingMethod === "Single Vote") {
      if (answer !== this.chosen[0].choice) {
        this.chosen = [];
        this.custom = "";
        this.chosenCustomIndex = -2;
      }
    }
    const index = this.chosenFindChoice(answer);
    if (index === this.chosenCustomIndex) {
      this.custom = "";
      this.chosenCustomIndex = -2;
      return;
    }
    if (index === -1) {
      const choice = {
        "choice": answer,
        "dates": []
      };
      if (this.lastChosen !== answer) {
        this.isAddingTime = false;
      }
      this.chosen.push(choice);
    } else {
      if (this.chosenCustomIndex !== -2 && this.chosenCustomIndex > index) {
        this.chosenCustomIndex--;        
      }
      if (this.lastChosen === answer) {
        this.isAddingTime = false;
      }
      this.chosen.splice(index, 1);
    }
  }

  vote() {
    this.voteNotification = false;
    if (
      this.chosen.length === 0 ||
      (this.chosen.length === 1 && this.chosen[0].choice === "")
    ) {
      this.voteMessage = "Please provide at least 1 choice before voting.";
      this.voteNotificationType = "is-danger";
      this.voteNotification = true;
      return;
    }
    if (this.votingMethod === "Ranked Voting" && this.mustRankAll) {
      let didRankAll = true;
      for (const answer of this.answers) {
        if (this.chosenFindChoice(answer) === -1) {
          didRankAll = false;
        }
      }
      if (!didRankAll) {
        this.voteMessage =
          "This event requires that you rank all of the available choices.";
        this.voteNotificationType = "is-danger";
        this.voteNotification = true;
        return;
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
      voter_username: this.username,
      voter_email: this.email,
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
        this.isVoteLoading = false;
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
          this.usernamePlaceholder += this.isVoterAnonymous ? " (optional)" : "" ;
          if (new Date(this.voteDeadline) < new Date()) {
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
