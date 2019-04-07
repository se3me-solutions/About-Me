<template>
  <div class="home">
    
    <div class="content">
        <h1>About Me!</h1>
        <p>Cria o teu quiz e vê qual dos teus amigos sabe mais sobre ti!</p>
    
        <h2>Seleciona um Quiz:</h2>

        <div class="theme-list">
          <div v-on:click="open()" class="theme-item quemsabemais">
            <h3>Quem sabe mais sobre mim?</h3>
          </div>
          <!--<div class="theme-item quemeigual">
            <h3>Quem é igual a mim?</h3>
          </div>-->
        </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'home',

    methods: {
      open() {
          this.$router.push('/createquiz/');
      }
    }

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
    font-size: 62px;
  }

  .home p {
    font-size: 32px;
  }

  .theme-item {
    cursor: pointer;
    margin: 20px;
    border: 1px solid black;
    height: 15vh;
    border-radius: 30px;
    color: white;
    display: flex;
    align-items: center;
    transition: all 0.2s;
  }

  .theme-item:hover {
    -webkit-box-shadow: 4px 3px 40px -16px rgba(0,0,0,0.75);
    -moz-box-shadow: 4px 3px 40px -16px rgba(0,0,0,0.75);
    box-shadow: 4px 3px 40px -16px rgba(0,0,0,0.75);
  }

  h3 {
    margin: auto;
    font-size: 34px;
  }

  h2 {
    font-size: 34px;
  }

  .quemsabemais {
    background-image: url('../assets/quemsabemais.jpg');
    background-size: 100%;
    background-position: center;
  }

  .quemeigual {
    background-image: url('../assets/quemeigual.jpg');
    background-size: 100%;
    background-position: center;
  }

</style>

