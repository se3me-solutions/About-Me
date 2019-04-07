<template>
<div v-if="this.loaded" class="home">

  <div v-if="!this.loggedIn">
    <login></login>
  </div>
   <div v-else>
       <div v-if="!this.leaderboard">
        <div class="space"></div>
            <span class="counter">{{ choose + 1}} / {{questions.length}}</span>
            <h1>{{questions[choose]}}</h1>
            <div class="question-list">

                <ul>
                    <li v-for="(answer, index) in answers[choose]" :key="index">
                        <div v-if="show">
                            <div v-if="index === correctAnswers[choose]" style="color: green;">{{answer}}</div>
                            <div v-else style="color: red;">{{answer}}</div>
                        </div>
                        <div v-else v-on:click="chooseAnswer(index)">{{answer}}</div>
                    </li>
                </ul>
            </div>
        </div>
        <div v-else>
            <h1>Quiz do(a) {{ name }}</h1>
            <div v-if="!this.hasAnswered">
            <p>Partilha o link com os teus amigos:</p>
            <div class="social-share">
                
                <p class="url">{{urlCopy}}</p>
                <button v-on:click="copy()">Copiar</button>
                 
            </div>
            </div>
            <div v-else>
                <h2>Resultado: {{percentage}}%</h2>
                <p>Acertaste {{correct}} / {{questions.length}} questões</p>

                <button v-on:click="openCreator()">Criar Quiz</button>
            </div>

            <h1>Leaderboard</h1>


            <table style="width:100%">
                <tr>
                    <th>Nome</th>
                    <th>Pontuação</th> 
                </tr>
                <tr v-for="(lead, index) in leader" :key="index">
                    <td>{{lead['name']}}</td>
                    <td>{{ lead['percentage'] }}%</td>
                </tr>
            </table>
        </div>
    </div>
</div>
</template>

<script>

import firebase,{ firestore } from 'firebase'
import login from './Login.vue'
import { setTimeout } from 'timers';

export default {
  name: 'quiz',

  components: {
      login,
  },

  data() {
      return {
          loggedIn: false,
          leaderboard: false,
          isCreating: false,
          hasAnswered: false,
          hasAnsQuestion: false,
          show: false,
          loaded: false,

          questionNumber: 1,
          quizId: null,
          userId: null,
          choose: 0,
          index: 0,
          percentage: 0,
          correct: 0,

          questions: [],
          answers: [],
          correctAnswers: [],
          choosen: [],
          leader: [],

          currentName: '',
          name: '',
          urlCopy: 'http://aboutme.se3me.com/quiz/' + this.$route.params.quizUrl,
          url: this.$route.params.quizUrl
      }
  },

   mounted() {
      this.loaded = true
     this.getQuestionsAndAnswers()
     
     firebase.auth().onAuthStateChanged((user) => {
         if(user) {

            firebase.firestore().collection("users").where("uid", "==", user.uid).get().then((query) => {
                
                if(!(this.$route.params.quizUrl === query.docs[0].id)) {
                            
                           if(this.$route.params.quizUrl) {
                           
                            const quemSabeMais = firebase.firestore().collection("quemSabeMais")

                            quemSabeMais.where("doc", "==", this.$route.params.quizUrl).get().then((snapshot) => {
                                this.correctAnswers = snapshot.docs[0].data().correctAnswers

                                var whoAnswered = snapshot.docs[0].data().otherAnswers

                                for(var i = 0; i < whoAnswered.length; i++) {   
                                    if(whoAnswered[i]["user"] === firebase.auth().currentUser.uid) {
                                        this.leaderboard = true
                                        this.percentage = whoAnswered[i]["percentage"]
                                        this.correct = this.percentage / 10
                                        this.hasAnswered = true
                                        this.getLeaderboard()
                                    }
                                }
                                
                                firebase.firestore().collection("users").doc(this.$route.params.quizUrl).get().then((query) => {
                                    this.name = query.data().name
                                })
                            })
                           }
                     } else {
                          firebase.firestore().collection("users").doc(this.$route.params.quizUrl).get().then((query) => {
                                    this.name = query.data().name
                                })
                     }

                // In case the user has already a quiz
                if(query.docs[0].data().hasQuiz) {
                    //If there's no quiz ID in the url, the user will be redirected to 
                    //their quiz URL
                    if(!this.$route.params.quizUrl) {
                        this.$router.push('/quiz/' + query.docs[0].id)
                        this.leaderboard = true
                        location.reload()
                    } else {
                        //If there's a Quiz Id and it's equal to the current user's id
                        if(this.$route.params.quizUrl === query.docs[0].id) {
                            this.leaderboard = true
                            this.getLeaderboard()
                        } 
                    }
                } else {
                    if(!this.$route.params.quizUrl) {
                        this.quizId = query.docs[0].id
                        this.isCreating = true
                    }
                }

                this.currentName = query.docs[0].data().name

            })

             this.toggleLoggedIn()
         }
     });

  },

    methods: {
        openCreator: function() {
            this.$router.push("/quiz/")
            location.reload()
        },
        copy: function() {
        this.$copyText('http://aboutme.se3me.com/quiz/' + this.url).then(() => {

            this.urlCopy = "URL Copiada!"
            
            }, function (e) {
            this.urlCopy = "Erro"
        })
    
        },

        getLeaderboard: function() {
            
                const quemSabeMais = firebase.firestore().collection("quemSabeMais")

                quemSabeMais.where("doc", "==", this.$route.params.quizUrl).get().then((snapshot) => {
                    this.leader = snapshot.docs[0].data().leaderboardPontuation
                    this.leader = this.leader.sort()
                })

        },
        chooseAnswer: function(index) {

            this.choosen.push(index)

            if(this.choose + 1 === this.questions.length) {

                    if(this.isCreating) {
                    firebase.firestore().collection("quemSabeMais").add({

                        userId: firebase.auth().currentUser.uid,
                        doc: this.quizId,
                        correctAnswers: this.choosen,
                        otherAnswers: [],
                        leaderboardPontuation: [],

                    }).then(() => {

                        this.$router.push('/quiz/' + this.quizId)
                        this.leaderboard = true
                        this.urlCopy = 'http://aboutme.se3me.com/quiz/' + this.quizId

                        firebase.firestore().collection("users").doc(this.quizId).update({

                            hasQuiz: true

                        });

            location.reload()
                    })
                } else {

                        this.show = true

                        var count = 0
                        // Cálculo da percentagem
                        var percentage = 0
                        for (var i = 0; i < this.correctAnswers.length; i++) {
                            if(this.choosen[i] === this.correctAnswers[i]) {
                                percentage += 10
                                count += 1
                            }
                        }

                        // Guarda na database
                        var uid = firebase.auth().currentUser.uid

                        const quemSabeMais = firebase.firestore().collection("quemSabeMais")
                        
                        quemSabeMais.where("doc", "==", this.$route.params.quizUrl).get().then((query) => {

                            quemSabeMais.doc(query.docs[0].id).update({

                                otherAnswers : firestore.FieldValue.arrayUnion({
                                        "user" : uid,
                                        "percentage" : percentage
                                    }),

                                leaderboardPontuation : firestore.FieldValue.arrayUnion(
                                    {
                                        "name" : this.currentName,
                                        "percentage" : percentage
                                    }
                                ),


                            }).then((query) => {

                                this.leaderboard = true
                                this.percentage = percentage
                                this.hasAnswered = true
                                this.correct = count

                                location.reload()
                            })
                        })
                     

                }
                

            } else {
                
                if(!this.isCreating) {
                    this.show = true
                    setTimeout(() => {
                        this.show = false
                        this.choose += 1
                    }, 1.5 * 1000)
                } else {
                this.choose += 1
                }
            }
        },
        toggleLoggedIn: function() {

            this.loggedIn = !this.loggedIn

        },

        getQuestionsAndAnswers: function() {

            firebase.firestore().collection("questions").get().then((snapshot) => {

                snapshot.docs.forEach((doc) => {

                    this.answers.push( doc.data().answers)
                    this.questions.push(doc.data().question)

                })
            })
        }
    },

 
  

}
</script>

<style scoped>

  .home {
    display: flex;
    flex-direction: center;
    text-align: center;
    padding: 10px;
  }
  .home h1 {
    color: #00A9B1;
    font-size: 37px;
  }

  .space {
      height: 30px;
  }

  .counter {
      margin: 10px;
      color: white;
      background: #00A9B1;
      padding: 10px;
      font-size: 26px;
      border-radius: 20px;
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

  .social-share .url {
      border: 1px solid black;
      border-radius: 50px;
      padding-top: 20px;
      padding-bottom: 20px;
      padding-left: 5px;
      padding-right: 5px;
      width: 100%;
      font-size: 13px;
  }

  input:focus {
      border: 2px solid #00A9B1;
  }

  *:focus {
      outline: none;
  }

    ul {
        border: 1px solid black;
        border-radius: 30px;
        padding: 0;
        width: 100%;
    }

  ul li {
      list-style: none;
      border-bottom: 1px solid black;
      cursor:pointer;
      margin: 0;
      font-size: 42px;
      padding: 10px;
  }

  ul li div {
      width: 100%;
      height: 100%;
      padding: 5px;
      margin: 0;
  }

  ul li:hover {
      color: rgb(116, 179, 22);
  }

    ul li:last-child {
        border-bottom: none;
    }

 

  button {
    margin-top: 10px;
    width: 150px;
    height: 60px;
    background: #2db81a;
    border: none;
    border-radius: 40px;
    color: white;
    font-weight: 400;
    font-size: 30px;
    cursor: pointer;
    -webkit-box-shadow: 4px 3px 40px -16px rgba(0,0,0,0.75);
    -moz-box-shadow: 4px 3px 40px -16px rgba(0,0,0,0.75);
    box-shadow: 4px 3px 40px -16px rgba(0,0,0,0.75);

  }
</style>

