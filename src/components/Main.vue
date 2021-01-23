<template>
  <div>
    <keep-alive>
      <div class="columns is-centered">
        <div class="column is-half mt-3">
          <new-event />
        </div>
      </div>
    </keep-alive>
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
    <section class="hero is-dark">
      <div class="hero-body has-text-centered">
        <div class="columns is-centered">
          <div class="column is-half">
            You can create an account and add friends. Then you can set yourself
            available for any number of tasks you want to join. When more
            friends also set themselves available for tasks, all of you will be
            notified.
          </div>
        </div>
      </div>
      <!-- <p>Do you have a poll ID and want to vote?<br />Enter it here:</p>
        <b-field label="Poll ID">
          <b-input class="is-success"></b-input>
          <b-button>Find</b-button>
        </b-field> -->
    </section>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import NewEvent from "@/components/NewEvent.vue";

@Component({
  components: {
    NewEvent,
  },
})
export default class Main extends Vue {}
</script>
