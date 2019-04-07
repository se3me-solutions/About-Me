<template>
  <div class="home">
    
    <div class="content">
        <h1>Antes de tudo!</h1>
        <p>Digita o teu nome para continuares</p>
    
        <input class="input" v-model="name" placeholder="Ex: Cristina" />
        
        <button v-on:click="login()">Continuar</button>
    </div>
    
  </div>
</template>

<script>
import firebase from 'firebase'

export default {
  name: 'login',

  data() {
    return {
        name,
    }
  },

  methods: {
      login() {

        firebase.auth().signInAnonymously().then((user) => {

            if (!user) {
                return;
            }

            let data = {
                name: this.name,
                uid: user.user.uid,
                quizes: [],
                hasQuiz: false,
            };

            this.$store.commit('setUser', data);

            firebase.firestore().collection("users").add(data).then(() => {

                // Volta para a página anterior
                this.$router.go(-1)

            });
        });
          }
  },
  

}
</script>

<style scoped>

  .home {
    display: flex;
    text-align: center;
    padding: 10px;
  }

  .home h1 {
    color: #00A9B1;
    font-size: 42px;
  }

  .home p {
    font-size: 21px;
  }

  .input {
      margin-top: 50px;
      height: 70px;
      width: 90%;
      border-radius: 30px;
      border: 2px solid black;
      padding-left: 30px;
      font-size: 24px;
      color: rgb(87, 87, 87);
      transition: all 0.3s;
  }

  input:focus {
      border: 2px solid #00A9B1;
  }

  *:focus {
      outline: none;
  }

  button {
    margin-top: 100px;
    width: 190px;
    height: 70px;
    background: #FA4333;
    border: none;
    border-radius: 40px;
    color: white;
    font-weight: 400;
    font-size: 26px;
    cursor: pointer;
    -webkit-box-shadow: 4px 3px 40px -16px rgba(0,0,0,0.75);
    -moz-box-shadow: 4px 3px 40px -16px rgba(0,0,0,0.75);
    box-shadow: 4px 3px 40px -16px rgba(0,0,0,0.75);

  }

</style>

