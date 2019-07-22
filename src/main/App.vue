<template>
    <div id="app" v-cloak class="mb-5">
        <!--<login-page v-if="!$root.isLoggedIn && $route.meta.loginRequired"></login-page>-->
        
        <template>
        <div class="container">
          <!-- Navigation -->
          <nav class="navbar navbar-expand-lg navbar-dark">
            <div class="container">
              <a class="navbar-brand" href="#"><i class="fas fa-sun"></i> AutoStarr v.{{ $root.version }}</a>
              <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarResponsive" aria-controls="navbarResponsive" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
              </button>
              <div class="collapse navbar-collapse" id="navbarResponsive">
                <ul class="navbar-nav ml-auto">
                  <li class="nav-item">
                    <router-link class="nav-link" to="/" :class="$root.screens.exploreActive">Explore</router-link>
                  <li class="nav-item">
                    <router-link class="nav-link" to="/crafting">Crafting</router-link>
                  </li>
                  </li>
                  <li class="nav-item">
                    <router-link class="nav-link" to="/player">Player</router-link>
                  </li>
                  <li class="nav-item">
                    <router-link class="nav-link" to="/inventory">Inventory</router-link>
                  </li>
                  <li class="nav-item">
                    <router-link class="nav-link" to="/spaceship">Spaceship</router-link>
                  </li>
                  <li class="nav-item">
                    <router-link class="nav-link" to="/rover">Rover</router-link>
                  </li>
                  <li class="nav-item dropdown">
                    <b-dropdown class="nav-link" text="Options">
                      <b-dropdown-item class="dropdown-item" @click="$root.save($root._data)">Save</b-dropdown-item>
                      <b-dropdown-item class="dropdown-item" @click="$root.hardReset()">Reset</b-dropdown-item>    
                      <b-dropdown-divider></b-dropdown-divider>
                      <b-dropdown-item class="dropdown-item" href="https://github.com/zachdyer/autostarr">GitHub</b-dropdown-item>
                    </b-dropdown>
                  </li>
                </ul>
              </div>
            </div>
          </nav>
        </div>

        <router-view></router-view>
        <!-- Footer -->
        <footer class="pt-2 pb-3 bg-dark fixed-bottom">
        <div class="container">
            <div class="row">
            <div class="col">
                <h6 class="text-white my-0"><i class="fas fa-bolt"></i> {{$root.player.energy.amount.toFixed()}} / {{$root.player.energy.max}}</h6>
                <div class="progress">
                <div class="progress-bar bg-warning" role="progressbar" v-bind:style="{width: (($root.player.energy.amount / $root.player.energy.max) * 100) + '%'}" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" id="fuel-level"></div>
                </div>
            </div>
            <div class="col">
                <h6 class="text-white my-0"><i class="fas fa-gas-pump"></i> {{$root.spaceship.fuel.amount.toFixed()}} / {{$root.spaceship.fuel.max}}</h6>
                <div class="progress">
                <div class="progress-bar bg-danger" role="progressbar" v-bind:style="{width: (($root.spaceship.fuel.amount / $root.spaceship.fuel.max) * 100) + '%'}" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" ></div>
                </div>
            </div>
            <div class="col" v-if="$root.rover">
                <h6 class="text-white my-0"><i class="fas fa-truck-pickup"></i> {{$root.roverFuelLevel()}}</h6>
                <div class="progress">
                <div class="progress-bar bg-danger" role="progressbar" v-bind:style="{width: $root.roverFuelPercent()}" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                </div>
            </div>
            </div>
        </div>
        <!-- /.container -->
        </footer>
        
      </template>
    </div>
</template>

<script>
    //import LoginPage    from './pages/login-page'
    export default {
        name: "App",
        /*components: {
            LoginPage
        }*/
    };
</script>

<style>
    /*body {padding-top: 70px}*/
</style>