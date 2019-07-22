<template>
    <div>
        <div class="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
            <h1 class="display-4">Login to Continue</h1>
            <p class="lead">This area requires user authentication.</p>
        </div>
        <form class="form-signin" v-on:submit.prevent="doLogin()">
            <div class="form-label-group">
                <input type="email" id="inputEmail" class="form-control" placeholder="Email address" v-model="username" required autofocus>
                <label for="inputEmail">Email address</label>
            </div>
            
            <div class="form-label-group">
                <input type="password" id="inputPassword" class="form-control" placeholder="Password" v-model="password" required>
                <label for="inputPassword">Password</label>
            </div>

            <button class="btn btn-lg btn-primary btn-block" type="submit"><i class="fas fa-key"></i> Sign in</button>
            <div class="text-center">
                <small class="text-success">
                    <i class="fas fa-lock"></i> 2048-bit encryption
                </small>
            </div>

            <div v-if="badCreds" class="alert alert-danger mt-3 text-center">Invalid Credentials.</div>
            <div v-if="badError" class="alert alert-danger mt-3 text-center">Unknown Error.</div>
        </form>
    </div>
</template>

<script>
    import axios from 'axios'
    export default {
        name: "LoginPage",
        data: function(){
            return {
                username: 'test@test.com',
                password: 'test',
                badCreds: false,
                badError: false,
            }
        },
        methods: {
            doLogin: function(){
                this.badCreds    = false
                this.badError    = false
                var bodyFormData = new FormData()
                bodyFormData.set('username', this.username)
                bodyFormData.set('password', this.password)
                let self = this
                self.$root.post( "/login", bodyFormData)
                .then(function (response) {
                    if (response.data.$root.user.loggedIn){
                        self.badCreds = false
                        self.$root.login()
                    }else{
                        self.badCreds = true
                        self.$root.logout()
                    }
                })
                .catch(function (error) {
                    self.$root.userHash = null
                    self.badError = true
                    console.log(error)
                })
                .finally(function () {
                    // always executed
                })
            }
        }
    };
</script>

<style></style>