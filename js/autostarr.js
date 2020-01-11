'use strict'
var autostarr = {
  vue: {
    el: "#app",
    data: {
      isRegistered: false,
      version: `40 Crafting Update and AutoSave is back`,
      isLoading: true,
      loadingImage: "./img/loading.gif",
      miningCarbon: false,
      isGameover: false,
      busy: false,
      progress: null,
      autostarr: {
        currentOrbit: null,
        starsystem: null,
        player: null,
        spaceship: null,
        planet: null,
        astroObject: null,
        explore: null,
        area: null,
        lastTick: null,
        rover: null,
        stars: {},
        screens: {
          explore: false,
          exploreActive: null,
          crafting: false,
          craftingActive: null,
          player: null,
          playerActive: null,
          inventory: false,
          inventoryActive: null,
          spaceship: false,
          spaceshipActive: null,
          rover: null,
          roverActive: null
        }
      }
    },
    created: function() {
       //Initialize game
      if(localStorage.autostarr) {
        this.autostarr = JSON.parse(localStorage.autostarr)
        this.isLoading = false
      } else {
        this.reset()
      }
      var self = this
      this.lastTick = Date.now()
      var now = Date.now()
      var tick = function() {
        //recharge energy in ship or rover
        if (self.autostarr.player.ship && self.autostarr.player.energy.amount < self.autostarr.player.energy.max || 
            self.autostarr.player.rover && self.autostarr.player.energy.amount < self.autostarr.player.energy.max) {
          self.autostarr.player.energy.amount += 1/60 
        }
        self.lastTick = now
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    },
    watch: {
      autostarr: {
        deep: true,
        handler() {
          localStorage.autostarr = JSON.stringify(this.autostarr)
        }
      }
    },
    methods: {
      selectAstroObject: function(astroId) {
        this.autostarr.spaceship.travel.targetPlanet = astroId
      },
      startMiningCarbon: function() {
        this.miningCarbon = true
      },
      stopMiningCarbon: function() {
        this.miningCarbon = false
      },
      mineCarbon: function() {
        if (this.autostarr.area.carbon.amount > 0 && this.miningCarbon && this.autostarr.player.storage.amount < this.autostarr.player.storage.max) {
          this.autostarr.player.energy.amount -= 1 / 60
          this.autostarr.area.carbon.amount -= 1 / 60
          this.autostarr.player.inventory.carbon += 1 / 60
          this.autostarr.player.storage.amount += 1 / 60
          if (this.autostarr.player.energy.amount <= 0) {
            this.gameover()
          }
        } else {
          this.autostarr.area.carbon.amount = 0
        }
      },
      mine: function(resource) {
        if (this.autostarr.area.resources[resource.item].amount > 0 && this.autostarr.player.storage.amount < this.autostarr.player.storage.max) {
          this.autostarr.player.energy.amount--
          if (this.autostarr.player.energy.amount <= 0) {
            this.gameover()
          } else {
            if(!this.autostarr.player.inventory[resource.item]){
              this.autostarr.player.inventory[resource.item] = {
                item: resource.item,
                alias: resource.alias,
                amount: 0,
                icon: resource.icon
              }
            }
            this.autostarr.area.resources[resource.item].amount--
            this.autostarr.player.inventory[resource.item].amount++
            this.autostarr.player.storage.amount++
          }
        }
      },
      removeCarbon() {
        if (this.autostarr.player.inventory.carbon >= 1) {
          this.autostarr.player.inventory.carbon--
            this.autostarr.player.storage.amount--
        } else {
          this.autostarr.player.inventory.carbon = 0
        }
      },
      mineMinerals() {
        if (this.autostarr.area.minerals.amount > 0 && this.autostarr.player.storage.amount < this.autostarr.player.storage.amount) {
          this.autostarr.player.energy.amount -= 1
          if (this.autostarr.player.energy.amount <= 0) {
            this.gameover()
          } else {
            this.autostarr.area.minerals.amount -= 1
            this.autostarr.player.inventory.minerals += 1
            this.autostarr.player.storage.amount += 1
          }
        }
      },
      removeMinerals() {
        if (this.autostarr.player.inventory.minerals >= 1) {
          this.autostarr.player.inventory.minerals--
            this.autostarr.player.storage.amount--
        } else {
          this.autostarr.player.inventory.minerals = 0
        }
      },
      gameover() {
        let explore = this.autostarr.explore
        let player = this.autostarr.player
        explore.jumbotron.image = "img/gameover.2.gif"
        if (player.energy.amount <= 0) {
          this.exploreSetAlert("alert-danger", `You died from running out of power. Game over.`)
        } else {
          this.exploreSetAlert("alert-danger", `You died. Game over.`)
        }
        player.energy.amount = 0
        this.isGameover = true
      },
      save() {
        var self = this
        this.exploreSetAlert("alert-warning",`Do not turn your console off while saving in progress.`,"fa-disk")
        this.progressAnimation(Date.now(), 3000, function(){
          self.exploreSetAlert("alert-success", `Save complete! :)`, "fa-disk")
          localStorage.setItem("autostarr", JSON.stringify(this.autostarr))
        })

      },
      reset() {
       //Initialize game
        this.autostarr.screens.explore = true
        this.autostarr.screens.exploreActive = "active"
        let starId = 3
        this.autostarr.stars[starId] = new StarSystem(starId)
        this.autostarr.starsystem = this.autostarr.stars[starId]
        let astroId = Math.floor((Math.random() * this.autostarr.starsystem.planets.length))
        this.autostarr.planet = this.autostarr.starsystem.planets[astroId]
        this.autostarr.currentOrbit = astroId
        let areaId = Math.floor((Math.random() * this.autostarr.planet.size))
        this.autostarr.area = new Area(starId, astroId, areaId)
        this.autostarr.planet.areas[areaId] = this.autostarr.area
        this.autostarr.player = new Player()
        this.autostarr.player.address = [starId, astroId, areaId]
        this.autostarr.spaceship = new SpaceShip(starId, astroId, areaId)
        this.autostarr.spaceship.target = this.autostarr.planet
        this.autostarr.spaceship.travel.targetPlanet = astroId
        this.autostarr.player.starDistance = this.autostarr.planet.starDistance
        this.autostarr.explore = new Explore()
        var self = this
        //preload images
        var jumboImg = new Image()
        jumboImg.src = "img/loading.gif"
        var spaceshipInterior = new Image()
        spaceshipInterior.src = "img/spaceship-interior.3.gif"
        var warp = new Image()
        warp.src = "img/warp.gif"
        new Image().src = "img/atmosphere-entry.gif"
        new Image().src = "img/gameover.2.gif"
        new Image().src = "img/walking.gif"
        this.progress.percent = 0
        this.isGameover = false
        jumboImg.addEventListener("load", function() {
          self.isLoading = false
//           self.exploreSetAlert("alert-danger", `Danger! Power levels are critically low. Find a charging station immediately.`, "fa-bolt")
          self.autostarr.explore.jumbotron.image = "img/spaceship-landed.jpg"
          self.autostarr.explore.jumbotron.title = "Unknown Area"
          self.autostarr.explore.jumbotron.description = `You awake on an alien planet. It appears your memory was corrupted and you have no record of how you got here. You are only familiar with the spaceship landed on the ground in the area.`
        })
      },
      hardReset() {
        if(confirm("Are you sure you want to restart? All progress will be lost.")){
          localStorage.clear()
          location.reload()
        }  
      },
      starNeighborName(direction){
        let id = this.autostarr.starsystem.id + direction
        let star = new StarSystem(id)
        return star.name
      },
      exploreScreen: function(){
        this.resetScreen()
        this.autostarr.screens.explore = true
        this.autostarr.screens.exploreActive = "active"
      },
      craftingScreen: function(){
        this.resetScreen()
        this.autostarr.screens.crafting = true
        this.autostarr.screens.craftingActive = "active"
      },
      playerScreen: function(){
        this.resetScreen()
        this.autostarr.screens.player = true
        this.autostarr.screens.playerActive = "active"
      },
      inventoryScreen: function(){
        this.resetScreen()
        this.autostarr.screens.inventory = true
        this.autostarr.screens.inventoryActive = "active"
      },
      spaceshipScreen: function(){
        this.resetScreen()
        this.autostarr.screens.spaceship = true
        this.autostarr.screens.spaceshipActive = "active"
      },
      roverScreen: function(){
        this.resetScreen()
        this.autostarr.screens.rover = true
        this.autostarr.screens.roverActive = "active"
      },
      resetScreen() {
        var screens = this.autostarr.screens
        screens.explore = false
        screens.crafting = false
      }
    }
  }
}