<template>
  <div class="columns is-centered">
    <div class="column is-one-third">
      The event's question is <b>{{ question }}</b> Please vote for your choice
      on the right!<br />
      <p v-if="isExpired">
        This event's voting deadline has passed! You can view the result at this <router-link :to="resultUrl">link.</router-link>
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
          size="is-medium"
          ><div :class="{'is-clickable': !isVoteDone, 'is-not-allowed': isVoteDone}" @click="toggleAnswer(answer)">
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
      <div class="has-text-centered">
        <b-button
          class="is-primary top-margin-tiny"
          :class="{ 'is-loading': isVoteLoading }"
          @click="vote"
          >Vote</b-button
        >
      </div>
      </fieldset>
    </div>
    <!-- the id of this event is: {{ this.$route.params.id }}
    {{ votingMethod }} {{ canWriteCustom }} -->
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class EventVote extends Vue {
  resultUrl = "/event/result/" + this.$route.params.id;
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
    if (
      this.chosen.length === 0 ||
      (this.chosen.length === 1 && this.chosen[0] === "")
    ) {
      this.$buefy.toast.open({
        message: "Please provide at least 1 choice before voting!",
        type: "is-danger",
      });
      return;
    }
    if (this.votingMethod === "Ranked Voting" && this.mustRankAll) {
      const didRankAll = this.answers.every((val) => this.chosen.includes(val));
      if (!didRankAll) {
        this.$buefy.dialog.alert({"message":
          "This event requires that you rank all of the available choices.", "type": "is-danger"}
        );
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
        "You have added your own choice to a rakned voting event. The rank of your custom choice is dependant on the order you wrote your custom choice."
      );
    }
    this.isVoteLoading = true;
    setTimeout(() => {
      this.isVoteLoading = false;
      this.isVoteDone = true;
    }, 300);
  }

  created() {
    if (this.isEventLoading) {
      // send api request
      setTimeout(() => {
        this.isEventLoading = false;
        this.votingMethod = "Ranked Voting";
        this.canWriteCustom = true;
        this.isVoterAnonymous = false;
        this.isVoteChangeable = false;
        this.voteDeadline = new Date("2022-1-2");
        this.answers = ["pizza", "burger"];
        this.question = "What do you want to eat?";
        this.mustRankAll = true;

        if (!this.isVoterAnonymous) {
          console.log("you have to provide a username to vote ? ? or profile?");
        }
        if (this.voteDeadline < new Date()) {
          this.isExpired = true;
        }
      }, 150);
    }
  }
  // send id and get back event details then when loaded let user vote
}
</script>

<style scoped>
.is-not-allowed {
  cursor: not-allowed;
}
.top-margin-tiny {
  margin-top: 0.3em;
}
.tag {
  padding: 1em;
  margin-right: 1em;
}
</style>
