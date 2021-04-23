<template>
  <div class="login">
    <h2>Login Page</h2>
    <!-- <img src= "../assets/login_mascot.png"> -->
    <div class="login_component">
      <input type= "text" @keyup.enter="login" v-model="email" placeholder= "email"><br>
      <input type= "password" @keyup.enter="login" v-model="password" placeholder= "password"><br>
      <button v-on:click="login">Login</button><br>
      <!-- <router-link to= "/signup"> --><button v-on:click="signup">Sign up</button><!--</router-link>-->
    </div>
  </div>
</template>

<script>
import axios from 'axios';
// import * as firebase from 'firebase/app';
// import 'firebase/auth';
//import 'firebase';
import welcome_sound from '../assets/audio/welcome_audio.mp3'
const welcome_audio = new Audio(welcome_sound)

export default {
  name: 'login',
  data() {
    return{
      email: '',
      password: '',
    }
  },
  methods: {
    signup(){
      this.$router.push("/signup");
    },
    login() {
      if (this.email === '') {
        alert('이메일을 입력해주세요.')
      } else if (this.password === '') {
        alert('비밀번호를 입력해주세요.')
      }
      else {
        axios.post('api/auth/login',{
          email: this.email,
          password: this.password,
        }).then((res)=> {
          console.log(res);
          this.$router.push("/video");
        })
        .catch(function(err) {
          console.log(err)
          alert(`로그인 실패. 이메일이나 비밀번호가 올바른지 확인해주세요.`);
        });
      }
      // firebase
      //   .auth()
      //   .setPersistence(firebase.auth.Auth.Persistence.SESSION)
      //   .then(() => {
      //       console.log("####", this);
      //       return firebase
      //         .auth()
      //         .signInWithEmailAndPassword(this.email, this.password);
      //     })
      //     .then(() => {
      //       const user = firebase.auth().currentUser;
      //       console.log(user);
      //       alert(`Welcome! ${user.email}`);
      //       this.$router.push("/video");
      //       // welcome_audio.play();
      //     })
      //     .catch(function(error) {
      //       const errorCode = error.code;
      //       const errorMessage = error.message;
      //       alert(errorMessage + errorCode);
      //     });
    },
  },
};
</script>

<style scoped>
  .login{
    margin-top: 70px;
  }
  h2 {
    text-align: center;
    margin-bottom: 20px;
  }
  img {
    float: left;
    width: 480px;
    height: 400px;
  }
  input {
    display: block;
    /* justify-content: center; */
    margin: 0px auto;
    outline: 2px solid #0055d5;
    width: 20%;
    padding: 15px;
    margin-left: auto;
    margin-right: auto;
  }
  button {
    display: block;
    /* justify-content: center; */
    margin: 0px auto;
    margin-top: 20px;
    width: 10%;
    margin-left: auto;
    margin-right: auto;
    cursor: pointer;
  }
</style>