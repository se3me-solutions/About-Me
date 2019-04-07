import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import QuizSnd from './views/QuizSnd.vue'
import CreateQuiz from './views/CreateQuiz.vue'
import termsofservice from './views/TermsOfService.vue'
import privacypolicy from './views/PrivacyPolicy.vue'

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/quiz/:quizUrl',
      name: 'quiz',
      component: QuizSnd,
    },
    {
      path: '/createquiz/',
      name: 'createquiz',
      component: CreateQuiz,
    },
    {
      path: '/termsofservice',
      name: 'termsofservice',
      component: termsofservice
    },
    {
      path: '/privacypolicy',
      name: 'privacypolicy',
      component: privacypolicy
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    }
  ]
})
