<template>
  <div class="columms">
    <div
      :class="{ 'column is-three-fifths is-offset-one-fifth': isUniqueUrl }"
      class="has-text-centered"
    >
      <p v-if="!isUniqueUrl">
        Result can be viewed at this
        <router-link :to="'/event/' + this.$store.state.eventId + '/result'"
          >link</router-link
        >.<br />
      </p>
      <p>
        The event's question is <b>{{ question }}</b
        ><br />
        <span v-if="isExpired"
          >The event reached its voting deadline at {{ votingDeadline }}.</span
        ><span v-else
          >The event will reach its voting deadline at {{ votingDeadline }}.
          <span v-if="isResultLive"
            >You can track the live result of the event as it is being voted by
            keeping this page open.</span
          ><span v-if="willEmail">
            <br />We will send you an email at {{ this.email }} when the voting
            deadline is reached!
          </span>
          <span v-else>
            <br /><a @click="setupEmail">Email me</a> when voting deadline is
            reached.
          </span></span
        ><br />
      </p>
      <p v-if="!isUniqueUrl">
        <a href="/">Click here</a> if you would like to submit another question!
      </p>
    </div>

    <div class="column is-half is-offset-one-quarter" v-if="isUniqueUrl">
      <p v-if="isExpired" class="is-size-4">
        As a group you chose: <b>{{ winners.join(", ") }}</b
        >.
      </p>
      You can expand each choice to see who voted for it. You can click on each voter to see any and all times they have specified for that choice.
      <b-table
        :data="data"
        :paginated="true"
        per-page="10"
        :pagination-simple="true"
        default-sort-direction="desc"
        :pagination-rounded="true"
        @details-open="(row, index) => loadVoters(row.choice)"
        detailed
        detail-key="choice"
        sort-icon="chevron-up"
        sort-icon-size="is-regular"
        default-sort="count"
        aria-next-label="Next page"
        aria-previous-label="Previous page"
        aria-page-label="Page"
        aria-current-label="Current page"
      >
        <b-table-column field="choice" label="Choice" v-slot="props">
          {{ props.row.choice }}
        </b-table-column>
        <b-table-column
          field="count"
          label="Count"
          sortable
          v-slot="props"
          width="90px"
        >
          {{ props.row.count }}
        </b-table-column>
        <template slot="detail" slot-scope="props">
          <div>
            <div :ref="'div-date-picker-' + props.row.choice" class="is-hidden"></div>
            <b-tag
              v-for="(voter, keyVoter) in props.row.voters"
              :key="keyVoter"
              class="p-1 mr-3"
              ><div @click="showVoterTimes(props.row.choice, voter)" class="is-clickable">{{ keyVoter }}</div></b-tag
            >
          </div>
        </template>
      </b-table>
      <b-collapse :open="false" position="is-bottom" aria-id="moreOptions">
        <a slot="trigger" slot-scope="props" aria-controls="moreOptions">
          <b-icon :icon="!props.open ? 'menu-down' : 'menu-up'"></b-icon>
          {{ !props.open ? "Show Results as Text" : "Close Results" }}
        </a>
        <vue-json-pretty class="has-text-left" :data="data"> </vue-json-pretty>
      </b-collapse>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import DatePicker from "vue-time-date-range-picker/dist/vdprDatePicker";
import axios from "axios";
import { Dictionary } from "vue-router/types/router";
import moment from "moment";
import VueJsonPretty from 'vue-json-pretty';
import "vue-json-pretty/lib/styles.css";

@Component({
  components: {
    DatePicker,
    VueJsonPretty
  },
})
export default class EventResult extends Vue {
  isUniqueUrl = false;
  question =
    this.$store.state.question === ""
      ? "loading question"
      : this.$store.state.question;
  votingDeadline =
    new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
  isResultLoading = true; // TODO websocket.io for constant results showing
  isEmailRequestLoading = false;
  hasClearWinner = false;
  answers: Record<string, number> = {};
  isExpired = false;
  isResultLive = true;
  willEmail = false;
  winners = ["burger", "NOTburger"];
  email = ""; // TODO sould get email from server, by using a POST on the usual GET url and providing admin token, backend checks if same and returns different return type
  emailNotification = false;
  emailMessage = "";
  emailMessageType = "";
  initialDates = [moment().toDate(), moment().toDate()];

  setupEmail() {
    if (this.email !== "") {
      this.isEmailRequestLoading = true;
      axios.patch(process.env.VUE_APP_BACKEND_API_BASE_URL + "event/" + this.$store.state.eventId + "/admin" , JSON.stringify({
        "admin_email": this.email,
        "will_email_admin": true,
      })).then(() => {
        this.emailNotification = true;
        this.emailMessage = "We will send you an email when voting is over.";
        this.emailMessageType = "is-success";
        this.willEmail = true;
        this.isEmailRequestLoading = false;
      }).catch((e) => {
        this.emailNotification = true;
        this.emailMessage = "Failed to send email reminder when voting is over.";
        this.emailMessageType = "is-danger";
        this.isEmailRequestLoading = false;
        console.log(e);
      });
    } else {
      this.$buefy.dialog.prompt({
        message: "Enter your email address",
        inputAttrs: {
          placeholder: "example@domain.com",
          type: "email",
        },
        trapFocus: true,
        onConfirm: (value) => {
          this.email = value;
          this.setupEmail();
        },
      });
    }
  }

  showVoterTimes(choice: String, voter: string[]) {
    let datePickerClass = Vue.extend(DatePicker);
    let datePicker: any;
    (this.$refs['div-date-picker-' + choice] as Element).innerHTML = '';
    (this.$refs['div-date-picker-' + choice] as Element).classList.add('is-hidden');
    voter.forEach((vote) => {
      if (vote[0] != null) {
        datePicker = new datePickerClass({
          propsData: {
            initialDates: [new Date(vote[0]), new Date(vote[1])],
          }
        });
        datePicker.$mount();
        (this.$refs['div-date-picker-' + choice] as Element).appendChild(datePicker.$el);
      }
    });
    if ((this.$refs['div-date-picker-' + choice] as Element).innerHTML == '') {
      (this.$refs['div-date-picker-' + choice] as Element).innerHTML = 'This voter has not voted for any particular time.';
    }
    (this.$refs['div-date-picker-' + choice] as Element).classList.remove('is-hidden');
  }

  loadVoters(choice: string) {
    const data = {
      "answer": choice
    };
    axios
      .post(
        process.env.VUE_APP_BACKEND_API_BASE_URL + "event/" + this.$store.state.eventId + "/voters",
        data
      )
      .then((response) => {        
        let votes:[[string, string, string]] = response.data;
        let voters:Record<string, string[][]> = {};
        this.data.forEach((item) => { // sucks that we have to search through this.data but it is needed for props.row.choice above in Vue's html rendering part... todo find a different way like a dict to begin with, key is choice, then the key can be repeated again as choice, but at least the find will be O(1) instead of O(n) :(
          if (item.choice === choice) {
            let voterTimes: string[][];
            votes.forEach((vote) => {
              if (!voters[vote[0]]) {
                voters[vote[0]] = [];
              }
              voters[vote[0]].push([vote[1], vote[2]]);
            });
            item.voters = voters;            
          }          
          // break;
          
        });            
      })
      .catch((error) => {
        console.log(error);
      });
  }

  __voters: Record<string, string[][]> = {};
  data = [
    { choice: "pizza", count: 2, voters: this.__voters},
    { choice: "burger", count: 3, voters: this.__voters},
    // { choice: "sushi", count: 2, voters: {'': [['', '']]} },
    // { choice: "potatoes", count: 3, voters: {'': [['', '']]} },
    // { choice: "cupcakes", count: 2, voters: {'': [['', '']]} },
    // { choice: "dougnuts", count: 3, voters: {'': [['', '']]} },
    // { choice: "bananas", count: 2, voters: {'': [['', '']]} },
    // { choice: "apples", count: 3, voters: {'': [['', '']]} },
    // { choice: "pasta", count: 2, voters: {'': [['', '']]} },
    // { choice: "spaghetti", count: 3, voters: {'': [['', '']]} },
    // { choice: "steak", count: 2, voters: {'': [['', '']]} },
    // { choice: "ham", count: 3, voters: {'': [['', '']]} },
    // { choice: "cold cuts", count: 2, voters: {'': [['', '']]} },
    // {
    //   choice:
    //     "cook with best ingredients ever mate, it'd be so good!!!!!! indeeeed brother long text",
    //   count: 3,
    //   voters: {'': [['', '']]},
    // },
    // { choice: "subsandwich", count: 2, voters: {'': [['', '']]} },
    // { choice: "sandwich", count: 3, voters: {'': [['', '']]} },
    // { choice: "roll", count: 2, voters: {'': [['', '']]} },
    // { choice: "pita", count: 3, voters: {'': [['', '']]} },
  ];
  columns = [
    {
      field: "count",
      label: "Count",
      numeric: true,
    },
    {
      field: "choice",
      label: "Choice",
    },
    {
      field: "voters",
      label: "Voters",
    },
  ];

  created() {
    // TODO send admin token and in the backend compare if same
    // if different then check if everyone sees the results or not
    const url = window.location.pathname.split("/");
    if (url[3] === "result") {
      this.isUniqueUrl = true;
      this.$store.commit("setEventId", url[2]);
    }
    if (Math.random() > 0.5) {
      this.isExpired = true;
    }
    if (this.$store.state.email !== "") {
      this.email = this.$store.state.email;
    }
    if (this.$store.state.question !== "") {
      this.question = this.$store.state.question;
    }
    axios.get(process.env.VUE_APP_BACKEND_API_BASE_URL + "event/" + this.$store.state.eventId + "/result")
      .then((response) => {
        const data = response.data;
        let _data;
        this.data = [];
        Object.keys(data).forEach((key) => {
          _data = {"choice":key, "count": data[key], "voters": {"click here to load voters for this choice": [['']]}};
          this.data.push(_data);
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }
  // if live then show current results
  // otherwise show deadline
  // if allowed to see then show results and so on
}
</script>

<style scoped></style>
