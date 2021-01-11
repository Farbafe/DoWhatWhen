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
import axios from "axios";

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
    const data = {
      "votes": this.chosen,
      "voter_username": "username_placeholder",
      "voter_email": "email placeHOL><:DER!"
    };
    axios.post("http://127.0.0.1:8000/events/" + this.$route.params.id + "/vote", data)
      .then((response) => {
        console.log(response);
        this.isVoteLoading = false;
        this.isVoteDone = true;
      })
      .catch((error) => {
        console.log(error);
      });
  }

  created() {
    if (this.isEventLoading) {
      axios.get("http://127.0.0.1:8000/events/" + this.$route.params.id)
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
.top-margin-tiny {
  margin-top: 0.3em;
}
.tag {
  padding: 1em;
  margin-right: 1em;
}
</style>
