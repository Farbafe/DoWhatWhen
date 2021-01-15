import Vue from "vue";
import Vuex, {Store} from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    eventId: "",
    question: "",
    canWriteCustom: false, // TODO turn this into a boolean, state manages yes/no to true/false
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
      if (value.canWriteCustom === "Yes") {
        state.canWriteCustom = true;
      } else {
        state.canWriteCustom = false;
      }
      state.answers = value.answers;
    },
    setEmail(state, value) {
      state.email = value;
  },
  actions: {},
  modules: {}
});
