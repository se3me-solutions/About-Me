<!--suppress SpellCheckingInspection, JSUnusedGlobalSymbols -->
<template>
    <div class="home" v-if="carregado">
        <div v-if="!this.leaderboard">
            <h1>Quiz do(a) {{ criadorQuiz }}</h1>
            <div class="space"></div>
            <span class="counter">{{ respostas.length + 1}} / {{perguntas.length}}</span>
            <h1>{{perguntas[respostas.length]}}</h1>
            <div class="question-list">

                <ul>
                    <li v-for="(answer, index) in respostasBase[respostas.length]" :key="index">
                        <div v-if="respondido">
                            <div v-if="index === respostasCorretas[respostas.length]" style="color: green;">{{answer}}</div>
                            <div v-else style="color: red;">{{answer}}</div>
                        </div>
                        <div v-else v-on:click="responderPergunta(index)">{{answer}}</div>
                    </li>
                </ul>
            </div>
            <button style="width: 200px;" v-on:click="mostrarLeaderboard(false, null)">Leaderboard</button>
        </div>

        <div v-else>
            <h1>Quiz do(a) {{ criadorQuiz }}</h1>
            <div v-if="percentagem === -1">
                <p>Partilha o link com os teus amigos:</p>
                <div class="social-share">

                    <p class="url">{{urlCopy}}</p>
                    <button v-on:click="copiar()">Copiar</button>

                </div>
            </div>
            <div v-else>
                <h2>Resultado: {{percentagem}}%</h2>
                <p>Acertaste {{percentagem / 10}} / {{perguntas.length}} questões</p>

                <button style="width: 150px;" v-on:click="createQuiz()">Criar Quiz</button>
            </div>

            <h1>Leaderboard</h1>


            <table style="width:100%">
                <tr>
                    <th>Nome</th>
                    <th>Pontuação</th>
                </tr>
                <tr v-for="(lead, index) in leaderboardJogadores" :key="index">
                    <td>{{lead['name']}}</td>
                    <td>{{ lead['percentage'] }}%</td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>

    import firebase from 'firebase'
    import { setTimeout } from 'timers';

    let usersCollection = null;
    let quemSabeMais = null;

    export default {
        name: 'QuizSnc',

        data() {
            return {
                perguntas: [],
                respostasCorretas: [],
                respostasBase: [],
                respostas: [],

                leaderboardJogadores: [],

                criadorQuiz: null,
                jogadorQuiz: null,

                percentagem: -1,

                urlCopy: 'https://aboutme.se3me.com/quiz/' + this.$route.params.quizUrl,
                criadorDoc: '',

                respondido: false,
                leaderboard: false,
                carregado: false,

            }

        },

        beforeMount() {
            usersCollection = firebase.firestore().collection("users");
            quemSabeMais = firebase.firestore().collection("quemSabeMais");
            //questionsCollection = firebase.firestore().collection("questions");
        },

        /*
            - Verificar se está logado
            - Verificar se o utilizador corrente é igual ao utilizador que criou o quiz
                - Enviar para a leaderboard
            - Senão
                - Verificar se o utilizador corrente já respondeu ao quiz
                    - Enviar para leaderboard
                - Senão
                    - Iniciar o jogo
         */
        mounted() {

            // Definimos a variável carregado como false para definirmos que a página não deverá ser carregada
            this.carregado = false;

            if(!this.$route.params.quizUrl) {
                this.$router.push('/');
                return;
            }

            // Caso o utilizador não esteja logado

            firebase.auth().onAuthStateChanged((user) => {

                if(!user) {
                    this.$router.push('/login/');
                } else {

                    usersCollection.where("uid", "==", user.uid).get().then((snapshot) => {

                        this.jogadorQuiz = snapshot.docs[0].data();


                        quemSabeMais.where("doc", "==", this.$route.params.quizUrl).get().then((query) => {

                            usersCollection.doc(this.$route.params.quizUrl).get().then((querySnap) => {
                                this.criadorQuiz = querySnap.data().name
                            });


                            let quemRespondeu = query.docs[0].data().leaderboardPontuation;
                            this.leaderboardJogadores = quemRespondeu;
                            this.criadorDoc = query.docs[0].id;
                            this.respostasCorretas = query.docs[0].data().correctAnswers;

                            if (this.$route.params.quizUrl === snapshot.docs[0].id) {
                                this.mostrarLeaderboard(true, null);

                            } else {


                                for (let i = 0; i < quemRespondeu.length; i++) {

                                    // Caso o utilizador corrente já tenha respondido ao quiz
                                    if (query.docs[0].data().otherAnswers[i]["user"] === user.uid) {
                                        this.mostrarLeaderboard(false, i);
                                        return;
                                    }
                                }
                            }
                        });

                    });
                }
                // Recebe as respostas corretas
                this.receberPerguntasERespostas();
                this.carregado = true;

            });



        },

        methods: {

            createQuiz() {
              this.$router.push('/createquiz/')
            },

            /**
             * Exibe a leaderboard
             * @param isCreator
             * @param user
             */
            mostrarLeaderboard(isCreator, user) {

                if(!isCreator && user) {
                    this.percentagem = this.leaderboardJogadores[user]["percentage"];
                }

                this.leaderboard = true;
                this.carregado = true;

            },

            /**
             * Função que responde à pergunta atual.
             * Caso seja detetado que o Quiz terminou, é chamado o procedimento terminarQuiz.
             * @param resposta
             */
            responderPergunta(resposta) {

                this.respondido = true;

                setTimeout(() => {
                    this.respostas.push(resposta);
                    this.respondido = false;
                }, 1.5 * 1000);
                if(this.respostas.length + 1 === this.respostasCorretas.length) {
                    this.terminarQuiz();
                }

            },

            /**
             * Procedimento para terminar o Quiz
             * Os dados são guardados na base de dados
             */
            terminarQuiz() {

                this.calcularPercentagem();


                quemSabeMais.doc(this.criadorDoc).update({

                    otherAnswers : firebase.firestore.FieldValue.arrayUnion({
                        "user" : this.jogadorQuiz.uid,
                        "percentage" : this.percentagem
                    }),

                    leaderboardPontuation : firebase.firestore.FieldValue.arrayUnion(
                        {
                            "name" : this.jogadorQuiz.name,
                            "percentage" : this.percentagem
                        }
                    ),

                }).then(() => {
                    this.mostrarLeaderboard(false, null)
                })

            },

            /**
             * Calcula a percentagem de respostas corretas
             */
            calcularPercentagem() {

                let percentagem = 0;

                for(let i = 0; i <= this.respostasCorretas.length; i++) {

                    if(this.respostas[i] === this.respostasCorretas[i]) {
                        percentagem += 10
                    }

                }

                this.percentagem = percentagem;

            },

            /**
             * Recebe as perguntas e as respostas do Quiz
             */
            receberPerguntasERespostas() {

                firebase.firestore().collection("questions").get().then((snapshot) => {

                    snapshot.docs.forEach((doc) => {
                        this.respostasBase.push(doc.data().answers);
                        this.perguntas.push(doc.data().question)
                    })

                });

            },

            copiar() {

                this.$copyText(this.urlCopy).then(() => {

                    this.urlCopy = "URL Copiada!"

                }, function () {
                    this.urlCopy = "Erro"
                })
            }



        }
    }
</script>


<style scoped src="./quiz.css"></style>