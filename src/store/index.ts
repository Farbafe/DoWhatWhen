import Vue from "vue";
import Vuex, { Store } from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    eventId: "",
    question: "",
    canWriteCustom: false,
    isCustomAnswersAdded: false,
    isVoteWhen: true,
    answers: [],
    email: "",
  },
  mutations: {
    setEventId(state, value) {
      state.eventId = value;
    },
    setQuestion(state, value) {
      state.question = value;
    },
    setAnswers(state, value) {
      state.canWriteCustom = value.canWriteCustom;
      state.isCustomAnswersAdded = value.isCustomAnswersAdded;
      state.isVoteWhen = value.isVoteWhen;
      state.answers = value.answers;
    },
    setEmail(state, value) {
      state.email = value;
    },
  },
  actions: {},
  modules: {}
});
