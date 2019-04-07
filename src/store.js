import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
  },
  mutations: {
    setUser (state, user)  {
      state.user = user
    },
    setQuiz(state, quiz) {
      state.user.hasQuiz = quiz;
    }
  },
  getters: {
    getUser: state => {
      return state.user
    }
  },
  actions: {

  }
})
