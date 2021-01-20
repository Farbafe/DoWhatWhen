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
      You can expand each choice to see who voted for it.
      <b-table
        :data="data"
        :paginated="true"
        per-page="10"
        :pagination-simple="true"
        default-sort-direction="desc"
        :pagination-rounded="true"
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
            <b-tag
              v-for="voter in props.row.voters"
              :key="voter"
              class="p-1 mr-3"
              ><div @click="changeVoters(props.row.choice)" class="is-clickable">{{ voter }}</div></b-tag
            >
          </div>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import axios from "axios";

@Component
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
  email = "";
  emailNotification = false;
  emailMessage = "";
  emailMessageType = "";

  setupEmail() {
    if (this.email !== "") {
      this.isEmailRequestLoading = true;
      setTimeout(() => {
        // TODO change event options to have email and change flag to true
        this.emailNotification = true;
        this.emailMessage = "We will send you an email when voting is over.";
        this.emailMessageType = "is-success";
        this.willEmail = true;
        this.emailNotification = true;
        this.emailMessage = "Failed to send email when voting is over.";
        this.emailMessageType = "is-danger";
        this.isEmailRequestLoading = false;
      }, 500);
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

  changeVoters(choice: string) {
    let voters: string[];
    const data = {
      answer: choice,
    };
    axios
      .post(
        "http://127.0.0.1:8000/event/" + this.$store.state.eventId + "/voters",
        JSON.stringify(data)
      )
      .then((response) => {
        voters = response.data;
        this.data.forEach((item) => {
          if (item.choice === choice) {
            item.voters = voters;
          }
        });      
      })
      .catch((error) => {
        console.log(error);
      });
  }

  data = [
    { choice: "pizza", count: 2, voters: ["click here to load voters for this choice"] },
    { choice: "burger", count: 3, voters: ["click here to load voters for this choice"] },
    { choice: "sushi", count: 2, voters: ["click here to load voters for this choice"] },
    { choice: "potatoes", count: 3, voters: ["click here to load voters for this choice"] },
    { choice: "cupcakes", count: 2, voters: ["click here to load voters for this choice"] },
    { choice: "dougnuts", count: 3, voters: ["click here to load voters for this choice"] },
    { choice: "bananas", count: 2, voters: ["click here to load voters for this choice"] },
    { choice: "apples", count: 3, voters: ["click here to load voters for this choice"] },
    { choice: "pasta", count: 2, voters: ["click here to load voters for this choice"] },
    { choice: "spaghetti", count: 3, voters: ["click here to load voters for this choice"] },
    { choice: "steak", count: 2, voters: ["click here to load voters for this choice"] },
    { choice: "ham", count: 3, voters: ["click here to load voters for this choice"] },
    { choice: "cold cuts", count: 2, voters: ["click here to load voters for this choice"] },
    {
      choice:
        "cook with best ingredients ever mate, it'd be so good!!!!!! indeeeed brother long text",
      count: 3,
      voters: ["click here to load voters for this choice"],
    },
    { choice: "subsandwich", count: 2, voters: ["click here to load voters for this choice"] },
    { choice: "sandwich", count: 3, voters: ["click here to load voters for this choice"] },
    { choice: "roll", count: 2, voters: ["click here to load voters for this choice"] },
    { choice: "pita", count: 3, voters: ["click here to load voters for this choice"] },
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
      this.$store.commit("setEventId", url[3]);
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
    axios.get("http://127.0.0.1:8000/event/" + this.$store.state.eventId + "/result")
      .then((response) => {
        const data = response.data;
        let _data;
        this.data = [];
        Object.keys(data).forEach((key) => {
          _data = {"choice":key, "count": data[key], "voters": ["click here to load voters for this choice"]};
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
