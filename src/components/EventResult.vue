<template>
  <div class="columms">
    <div :class="{'column is-three-fifths is-offset-one-fifth': isUniqueUrl}" class="has-text-centered">
      <p v-if="!isUniqueUrl">
        Result can be viewed at this
        <router-link :to="'/event/result/' + this.$store.state.eventId"
          >link</router-link
        >.<br />
      </p>
      <p>
        The event's question is <b>{{ question }}</b><br />
        <span v-if="isExpired"
          >The event reached its voting deadline at {{ votingDeadline }}.</span
        ><span v-else
          >The event will reach its voting deadline at {{ votingDeadline }}.
          <span v-if="isResultLive"
            >You can track the live result of the event as it is being voted by
            keeping this page open.</span
          ></span
        ><br />
        <span v-if="willEmail">
          We will send you an email at {{ email }} when the voting deadline is reached!
        </span>
        <span v-else>
          <a @click="setupEmail">Email me</a> when voting deadline is reached.
        </span>
      </p>
      <p v-if="!isUniqueUrl">
        <a href="/">Click here</a> if you would like to submit another question!
      </p>
    </div>

    <div class="column is-half is-offset-one-quarter" v-if="isUniqueUrl">
      <p v-if="isExpired" class="is-size-4">As a group you chose: <b>{{ winners.join(", ") }}</b>.</p>
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
            <b-tag v-for="voter in props.row.voters" :key="voter">{{
              voter
            }}</b-tag>
          </div>
        </template>
      </b-table>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class EventResult extends Vue {
  isUniqueUrl = false;
  question = "What shall we eat at the final dress rehearsal";
  votingDeadline = new Date().toLocaleDateString() + new Date().toLocaleTimeString();
  isResultLoading = true; // TODO websocket.io for constant results showing
  isEmailRequestLoading = false;
  hasClearWinner = false;
  answers: Record<string, number> = {};
  isExpired = false;
  isResultLive = true;
  email = "best@example.com";
  willEmail = false;
  winners = ["burger", "NOTburger"]

  setupEmail(forceIf = false, email: string) {
    if (Math.random() > 0.5 || forceIf === true) {
    // alright we either have the email address and send it or we don't have it
    // or user is logged in and profile-wide no emails, so this is a force email on THIS one matter, ok?
      this.isEmailRequestLoading = true;
      setTimeout(() => {
      this.$buefy.toast.open({
        message: "We will send you an email when done!",
        type: "is-success",
      });
      this.willEmail = true;
      this.email = email == null ? this.email : email;
      this.isEmailRequestLoading = false;
      }, 500);
    }
    else {
      this.$buefy.dialog.prompt({
                message: "Enter your email address",
                inputAttrs: {
                    placeholder: "example@domain.com",
                    type: "email"
                },
                trapFocus: true,
                onConfirm: (value) => this.setupEmail(true, value)
            });
    }
  }

  data = [
    { choice: "pizza", count: 2, voters: ["mike", "anna"] },
    { choice: "burger", count: 3, voters: ["anon", "mike", "whe"] },
    { choice: "sushi", count: 2, voters: ["mike", "anna"] },
    { choice: "potatoes", count: 3, voters: ["anon", "mike", "whe"] },
    { choice: "cupcakes", count: 2, voters: ["mike", "anna"] },
    { choice: "dougnuts", count: 3, voters: ["anon", "mike", "whe"] },
    { choice: "bananas", count: 2, voters: ["mike", "anna"] },
    { choice: "apples", count: 3, voters: ["anon", "mike", "whe"] },
    { choice: "pasta", count: 2, voters: ["mike", "anna"] },
    { choice: "spaghetti", count: 3, voters: ["anon", "mike", "whe"] },
    { choice: "steak", count: 2, voters: ["mike", "anna"] },
    { choice: "ham", count: 3, voters: ["anon", "mike", "whe"] },
    { choice: "cold cuts", count: 2, voters: ["mike", "anna"] },
    {
      choice:
        "cook with best ingredients ever mate, it'd be so good!!!!!! indeeeed brother long text",
      count: 3,
      voters: ["anon", "mike", "whe"],
    },
    { choice: "subsandwich", count: 2, voters: ["mike", "anna"] },
    { choice: "sandwich", count: 3, voters: ["anon", "mike", "whe"] },
    { choice: "roll", count: 2, voters: ["mike", "anna"] },
    { choice: "pita", count: 3, voters: ["anon", "mike", "whe"] },
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
    if (window.location.pathname.split("/")[2] === "result") {
      this.isUniqueUrl = true;
    }
    if (Math.random() > 0.5) {
      this.isExpired = true;
    }
  }
  // if live then show current results
  // otherwise show deadline
  // if allowed to see then show results and so on
}
</script>

<style scoped>
.tag {
  padding: 0.5em;
  margin-right: 0.4em;
}
</style>
