<template>
  <div class="main">
    <div class="columns is-centered">
      <div class="column is-half">
        <keep-alive>
          <new-event />
        </keep-alive>
      </div>
      <div class="column is-one-third">
        <p>
          Never spend another minute arguing where or what to eat!
          If your group can't decide when to eat, what movie to watch or what sport to play use
          the form to create an event to poll opinions. Then you can share it with
          your friends and vote for your choice!
        </p>
        <br />
        <!-- <p>
          If you already created a poll and want to re-access it then toggle
          this switch!
        </p>
        <div class="field">
          <b-switch
            v-model="isNewEvent"
            true-value="New Poll"
            false-value="Existing Poll"
          >
            {{ isNewEvent }}
          </b-switch>
          <br />
        </div> -->
        <p>No account necessary! With an account you can add friends, share to all friends automatically using 1 click and use more features!</p>
      </div>
    </div>
    <section class="hero is-dark">
      <div class="hero-body has-text-centered">
        
        <!-- <p>Do you have a poll ID and want to vote?<br />Enter it here:</p>
        <b-field label="Poll ID">
          <b-input class="is-success"></b-input>
          <b-button>Find</b-button>
        </b-field> -->
      </div>
    </section>
  </div>
</template>

<script lang="ts">
// import { loremIpsum, LoremIpsum } from "lorem-ipsum";
import { Component, Prop, Vue } from "vue-property-decorator";
import NewEvent from "@/components/NewEvent.vue";

// const lorem = new LoremIpsum({
//   sentencesPerParagraph: {
//     max: 8,
//     min: 4
//   },
//   wordsPerSentence: {
//     max: 16,
//     min: 4
//   }
// });

@Component({
  components: {
    NewEvent,
  },
})
export default class Main extends Vue {
  //   paragraphs = (function() {
  //     const arr: string[] = [];
  //     for (let i = 0; i <= 3; ++i) {
  //       arr.push(lorem.generateParagraphs(1));
  //     }
  //     return arr;
  //   })();
}
</script>
