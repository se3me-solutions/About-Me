<template>
  <div id="app">
    <div class="app-content">
      <div id="nav">
        <img v-on:click="goToHome()" width="150" src="./assets/logo-nobackground.png" />
      </div>
      <div class="the-app-content">
      <router-view class="router-view" />
    </div>
    <footer>
      <a href="/termsofservice/">Terms of service</a>
      <a href="/privacypolicy/">Privacy Policy</a>
    </footer>
    </div>
  </div>
</template>
<script>

import firebase from 'firebase'

export default {
  name: 'App',

  beforeMount() {
    document.title = "SE3ME | About Me";

    firebase.initializeApp(config);

    firebase.auth().onAuthStateChanged((user) => {

      if(user) {

        firebase.firestore().collection("users").where("uid", "==", user.uid).get().then((snapshot) => {
          this.$store.commit("setUser", snapshot.docs[0].data());
        })

      }

    })

  },
  methods: {
    goToHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style>
body {
  margin: 0;
  font-family: 'Open Sans', sans-serif;
}
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.app-content {
  width: 100%;
  
}

.the-app-content {
  margin: auto;
  display: flex;
  align-items: center;
}

.router-view {
  margin: auto;
}

#nav {
  border-bottom: 1px solid rgb(199, 199, 199);
  padding: 15px;
}



#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

footer {
   bottom:0;
   width:100%;
   height:30px;   
   text-align: center;
   border-top: 1px solid rgb(199, 199, 199);
   padding-top: 10px;
}

footer a {
  margin-left: 20px;
  text-decoration: none;
  color: black;
}
</style>
