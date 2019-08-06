'use strict'
var autostarr = {
  vue: {
    el: "#app",
    data: {
      isRegistered: false,
      version: `39 Crafting Update`,
      autoSave: false,
      isLoading: true,
      loadingImage: "./img/loading.gif",
      currentOrbit: null,
      starsystem: null,
      player: null,
      spaceship: null,
      progress: null,
      planet: null,
      astroObject: null,
      explore: null,
      area: null,
      miningCarbon: false,
      lastTick: null,
      isGameover: false,
      busy: false,
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
    },
    created: function() {
      //Initialize game
      autostarr.spaceship.engineNoise.src = "audio/spaceship.mp3"
      if (localStorage.getItem("autostarr")) {
        this.data = JSON.parse(localStorage.autostarr)
      } else {
        this.reset()
      }
      var self = this
      this.lastTick = Date.now()
      var now = Date.now()
      var tick = function() {
        //recharge energy in ship or rover
        if (self.player.ship && self.player.energy.amount < self.player.energy.max || 
            self.player.rover && self.player.energy.amount < self.player.energy.max) {
          self.player.energy.amount += 1/60 
        }
        self.lastTick = now
        if(self.autoSave) {
          self.save(self._data)
        }
        requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    },
    watch: {
      //Where updated variables can be saved
    },
    methods: {
      selectAstroObject: function(astroId) {
        this.spaceship.travel.targetPlanet = astroId
        console.log(astroId)
      },
      startMiningCarbon: function() {
        this.miningCarbon = true
      },
      stopMiningCarbon: function() {
        this.miningCarbon = false
      },
      mineCarbon: function() {
        if (this.area.carbon.amount > 0 && this.miningCarbon && this.player.storage.amount < this.player.storage.max) {
          this.player.energy.amount -= 1 / 60
          this.area.carbon.amount -= 1 / 60
          this.player.inventory.carbon += 1 / 60
          this.player.storage.amount += 1 / 60
          if (this.player.energy.amount <= 0) {
            this.gameover()
          }
        } else {
          this.area.carbon.amount = 0
        }
      },
      mine: function(resource) {
        if (this.area.resources[resource.item].amount > 0 && this.player.storage.amount < this.player.storage.max) {
          this.player.energy.amount--
          if (this.player.energy.amount <= 0) {
            this.gameover()
          } else {
            if(!this.player.inventory[resource.item]){
              this.player.inventory[resource.item] = {
                item: resource.item,
                alias: resource.alias,
                amount: 0,
                icon: resource.icon
              }
            }
            this.area.resources[resource.item].amount--
            this.player.inventory[resource.item].amount++
            this.player.storage.amount++
          }
        }
      },
      removeCarbon() {
        if (this.player.inventory.carbon >= 1) {
          this.player.inventory.carbon--
            this.player.storage.amount--
        } else {
          this.player.inventory.carbon = 0
        }
      },
      mineMinerals() {
        if (this.area.minerals.amount > 0 && this.player.storage.amount < this.player.storage.amount) {
          this.player.energy.amount -= 1
          if (this.player.energy.amount <= 0) {
            this.gameover()
          } else {
            this.area.minerals.amount -= 1
            this.player.inventory.minerals += 1
            this.player.storage.amount += 1
          }
        }
      },
      removeMinerals() {
        if (this.player.inventory.minerals >= 1) {
          this.player.inventory.minerals--
            this.player.storage.amount--
        } else {
          this.player.inventory.minerals = 0
        }
      },
      gameover() {
        let explore = this.explore
        let player = this.player
        explore.jumbotron.image = "img/gameover.2.gif"
        if (player.energy.amount <= 0) {
          this.exploreSetAlert("alert-danger", `You died from running out of power. Game over.`)
        } else {
          this.exploreSetAlert("alert-danger", `You died. Game over.`)
        }
        player.energy.amount = 0
        this.isGameover = true
      },
      save(data) {
        var self = this
        let explore = autostarr.explore
        let progress = autostarr.progress
        this.exploreSetAlert("alert-warning",`Do not turn your console off while saving in progress.`,"fa-disk")
        progress.animation(Date.now(), 3000, function(){
          self.exploreSetAlert("alert-success", `Save complete! :)`, "fa-disk")
          localStorage.setItem("autostarr", JSON.stringify(data))
        })

      },
      reset() {
        //Initialize game
        this.screens.explore = true
        this.screens.exploreActive = "active"
        let starId = 3
        this.stars[starId] = new StarSystem(starId)
        this.starsystem = this.stars[starId]
        let astroId = Math.floor((Math.random() * this.starsystem.planets.length))
        this.planet = this.starsystem.planets[astroId]
        this.currentOrbit = astroId
        let areaId = Math.floor((Math.random() * this.planet.size))
        this.area = new Area(starId, astroId, areaId)
        this.planet.areas[areaId] = this.area
        this.player.address = [starId, astroId, areaId]
        this.spaceship = new SpaceShip(starId, astroId, areaId)
        this.spaceship.target = this.planet
        this.spaceship.travel.targetPlanet = astroId
        this.player.starDistance = this.planet.starDistance
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
        this.progress.percent = 0
        this.isGameover = false
        jumboImg.addEventListener("load", function() {
          self.isLoading = false
          self.exploreSetAlert("alert-danger", `Danger! Power levels are critically low. Find a charging station immediately.`, "fa-bolt")
          self.explore.jumbotron.image = "img/spaceship-landed.jpg"
          self.explore.jumbotron.title = "Unknown Area"
          self.explore.jumbotron.description = `You awake on an alien planet. It appears your memory was corrupted and you have no record of how you got here. You are only familiar with the spaceship landed on the ground in the area.`
        })
      },
      hardReset() {
        if(confirm("Are you sure you want to restart? All progress will be lost.")){
          this.autoSave = false
          localStorage.clear()
          location.reload()
        }  
      },
      starNeighborName(direction){
        let id = this.starsystem.id + direction
        let star = new StarSystem(id)
        return star.name
      },
      exploreScreen: function(){
        this.resetScreen()
        this.screens.explore = true
        this.screens.exploreActive = "active"
      },
      craftingScreen: function(){
        this.resetScreen()
        this.screens.crafting = true
        this.screens.craftingActive = "active"
      },
      playerScreen: function(){
        this.resetScreen()
        this.screens.player = true
        this.screens.playerActive = "active"
      },
      inventoryScreen: function(){
        this.resetScreen()
        this.screens.inventory = true
        this.screens.inventoryActive = "active"
      },
      spaceshipScreen: function(){
        this.resetScreen()
        this.screens.spaceship = true
        this.screens.spaceshipActive = "active"
      },
      roverScreen: function(){
        this.resetScreen()
        this.screens.rover = true
        this.screens.roverActive = "active"
      },
      resetScreen() {
        var screens = this.screens
        screens.explore = false
        screens.crafting = false
      }
    }
  }
}