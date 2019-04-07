import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import VueClipboard from 'vue-clipboard2'

VueClipboard.config.autoSetContainer = true;// add this line
Vue.use(VueClipboard);

Vue.config.productionTip = false;

 new Vue({
      el: '#app',
      store,
      router,
      components: { App },
      template: '<App/>'
    });
    
