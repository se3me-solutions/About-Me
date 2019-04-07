<template>
    <div class="home">
        <div>
            <div class="space"></div>
            <span class="counter">{{ respostas.length + 1}} / {{perguntas.length}}</span>
            <h1>{{perguntas[respostas.length]}}</h1>
            <div class="question-list">

                <ul>
                    <li v-for="(answer, index) in respostasBase[respostas.length]" :key="index">
                        <div v-on:click="responderPergunta(index)">{{answer}}</div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>

    import firebase from 'firebase'

    export default {
        name: "CreateQuiz",

        data() {
            return {
                respostas: [],
                respostasBase: [],
                perguntas: [],

                utilizador: null,
                documento: '',
            }
        },

        /**
         * Verificar se o utilizador está logado
         *      - Se estiver
         *          Verificar se já tem um quiz
         *              - Enviar para a url do quiz
         *          - Se não
         *              * Receber perguntas e respostas
         *      - Se não
         *          * Pedir Login
         */
        mounted() {

            firebase.auth().onAuthStateChanged((user) => {

                if(user) {

                    firebase.firestore().collection("users").where("uid", "==", user.uid).get().then((snapshot) => {
                        this.$store.commit("setUser", snapshot.docs[0].data());
                        this.utilizador = snapshot.docs[0].data();

                        this.utilizador = this.$store.getters.getUser;



                        firebase.firestore().collection("users").where("uid", "==", this.utilizador.uid).get().then((snapshot) => {
                            this.documento = snapshot.docs[0].id;

                            if(this.utilizador.hasQuiz) {
                                this.$router.push('/quiz/' + this.documento);
                            }
                        });



                        this.receberPerguntasERespostas();
                    })
                } else {
                    this.$router.push('/login/');
                }

            });

        },

        methods: {

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

            responderPergunta(resposta) {

                this.respostas.push(resposta);

                if(this.respostas.length === 10) {
                    this.terminarQuiz();
                }
            },

            terminarQuiz() {

                firebase.firestore().collection("quemSabeMais").add({

                    userId: this.utilizador.uid,
                    doc: this.documento,
                    correctAnswers: this.respostas,
                    otherAnswers: [],
                    leaderboardPontuation: [],

                }).then(() => {

                    firebase.firestore().collection("users").doc(this.documento).update({
                        hasQuiz: true
                    });

                    this.$store.commit('setQuiz', true);

                    this.$router.push('/quiz/' + this.documento);
                })

            },


        }
    }
</script>

<style scoped src="./quiz.css"></style>