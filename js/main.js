var json = []
var app = new Vue({
  el: "#app",
  data: {
    isLoading : true,  
    loadingImage   : "./img/loading.gif",
    currentOrbit : 0, 
    starsystem   : null,
    player       : null,
    spaceship    : null,
    progressBar: {
      title: null,
      message: null,
      percent: 0,
      show: false,
      alertType: "alert-info",
      icon: "fa-search"
    },
    jumbotron: {
      image: "./img/loading.gif",
      title: null,
      description: null
    },
    planet: null,
    alert: {
      show: false,
      type: "alert-info",
      message: null
    },
    targetPlanet: 0,
    area: null,
    miningCarbon: false,
    scanner: {
      title: "Scan",
      percent: 0
    },
    lastTick: null,
    isGameover: false
  },
  created: function() {
    //Initialize game
    let starId = 3
    let planetId = 0
    let areaId = 0
    this.starsystem = new StarSystem(starId)
    this.planet = this.starsystem.planets[planetId]
    this.area = this.planet.areas[areaId]
    this.player     = new Player(1, [starId, planetId, areaId])
    this.spaceship  = new SpaceShip(1, this.player.address)
    this.spaceship.travel.targetPlanet = this.planet
    this.player.starDistance = this.planet.starDistance
    var self = this
    //preload images
    var jumboImg = new Image()
    jumboImg.src = "img/spaceship-landed.jpg"
    this.area.image = jumboImg.src
    var spaceshipInterior = new Image()
    spaceshipInterior.src = "img/spaceship-interior.2.jpg"
    var warp = new Image()
    warp.src = "img/warp.gif"
    new Image().src = "img/atmosphere-entry.gif"
    new Image().src = "img/gameover.2.gif"
    jumboImg.addEventListener("load", function(){
      self.isLoading = false
      self.setAlert("alert-danger", `Danger! Power levels are critically low. Find a charging station immediately.`)
      self.jumbotron.image = "img/spaceship-landed.jpg"
      self.jumbotron.title = "Unknown Area"
      self.jumbotron.description = `You awake on an alien planet. It appears your memory was corrupted and you have no record of how you got here. You are only familiar with the spaceship landed on the ground in the area.` 
    })
    this.lastTick = Date.now()
    var now = Date.now()
    var tick = function() {
      //mine carbon
      if(self.miningCarbon) {
        self.mineCarbon()
        if(self.player.energy.amount <= 0) {
          self.gameover()
          return
        }
      }
      
      //recharge energy
      if(self.player.ship && self.player.energy.amount < self.player.energy.max) {
        self.player.energy.amount += 1/60
      }
      self.lastTick = now
      requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    
  },
  methods: {
    launch: function() {
      if(this.spaceship.fuel >= 5) {
        this.spaceship.isMoving = true
        this.player.isLanded = false
        //Launch from planet
        this.progressBar.title = `Initializing launch...`
        var self = this
        let callback = function(){
          self.setAlert("alert-success", `You successfully entered ${self.planet.name}'s orbit.`)
          self.spaceship.isMoving = false
          self.player.isLanded = false
          self.player.isOrbiting = true
          self.spaceship.isOrbiting = true
          self.player.address.pop()
          self.spaceship.address = self.player.address
          self.jumbotron.image = self.planet.image
          self.jumbotron.title = `Orbiting ${self.planet.title}`
          self.jumbotron.description = self.planet.description
        }
        var start = Date.now()
        this.spaceship.travel.distance = 5000
        var now = Date.now()
        var lastTick = Date.now()
        var tick = function(){
          let progress = Date.now() - start
          if(progress < self.spaceship.travel.distance) {
            //consume fuel
            now = Date.now()
            self.spaceship.fuel -= 1/(1000/(now - lastTick))
            if(self.spaceship.fuel <= 0 ) {
              self.spaceship.fuel = 0
              return false
            }
            self.progressBar.percent = (progress / self.spaceship.travel.distance) * 100 
            self.spaceship.progress.travel = (progress / self.spaceship.travel.distance) * 100 
            lastTick = now
            requestAnimationFrame(tick)
          } else {
            callback()
            self.spaceship.progress.launch = 0
            self.spaceship.progress.travel = 0
            self.progressBar.percent = 0
          } 
        }
        requestAnimationFrame(tick)
      } else {
        this.setAlert("alert-warning", `Not enough fuel for launch!`)
      }
      
    },
    travel: function(planetId) {
      var player = this.player
      var jumbotron = this.jumbotron
      var self = this
      var targetPlanet = this.starsystem.planets[planetId]
      this.spaceship.travel.targetPlanet = targetPlanet
      this.spaceship.travel.direction = 1
      if(targetPlanet.starDistance < player.starDistance) {
        this.spaceship.travel.direction = -1
      }
      this.currentOrbit = null
      this.spaceship.progress.travel = 0
      this.spaceship.isMoving = true
      this.spaceship.isOrbiting = false
      this.player.isMoving = false
      this.player.isOrbiting = false
     
      //Travel to another planet
      self.jumbotron.image = "img/warp.gif"
      self.jumbotron.title = `Destination Planet: ${targetPlanet.name}`
      
      this.spaceship.travel.start = Date.now()
      this.spaceship.travel.distance = Math.abs(targetPlanet.starDistance - this.player.starDistance)
      var lastTick = Date.now()
      var tick = function(){
        let progress = Date.now() - self.spaceship.travel.start
        if(progress < self.spaceship.travel.distance) {
          //consume fuel
          now = Date.now()
          self.spaceship.fuel -= 1/(1000/(now - lastTick))
          if(self.spaceship.fuel <= 0 ) {
            self.spaceship.fuel = 0
            self.gameover()
            return
          }
          self.progressBar.percent = (progress / self.spaceship.travel.distance) * 100 
          self.spaceship.progress.travel = (progress / self.spaceship.travel.distance) * 100 
          //update player distance from star
          self.player.starDistance = self.planet.starDistance + progress * self.spaceship.travel.direction
          lastTick = now
          requestAnimationFrame(tick)
        } else {
          self.spaceship.progress.travel = 0
          self.progressBar.percent = 0
          self.planet = self.spaceship.travel.targetPlanet
          self.player.address[1] = self.planet.id
          self.setAlert("alert-success",`Successfully arrived!`)
          self.jumbotron.image = self.planet.image
          self.jumbotron.title = `Orbiting Planet ${self.planet.name}` 
          self.jumbotron.description = self.planet.description
          self.currentOrbit = self.planet.id
          self.player.starDistance = self.planet.starDistance
          self.spaceship.isMoving = false
          self.spaceship.isOrbiting = true
          self.player.isOrbiting = true
        } 
      }
      requestAnimationFrame(tick)
    },
    scan: function(){
      let player = this.player
      player.isScanning = true
      this.setAlert("alert-info","Scanning...")
      this.progressBar.percent = 0
      var self = this
      let i = 0
      let planetCount = this.starsystem.planets.length
      var loop = setInterval(function(){
        if (i >= self.starsystem.planets.length){
          self.player.isScanning = false
          self.progressBar.title = `Scan Complete`
          self.setAlert("alert-success",`Scan Complete. You discovered ${self.starsystem.planetTotal} planets!`)
          self.progressBar.percent = 0
          clearInterval(loop)
        }else{          
          self.starsystem.planets[i++].scanned = true
          self.scanner.percent, 
          self.progressBar.percent = (i / planetCount) * 100
        }
      },500)    
    },
    land: function(planet) {
      this.spaceship.isMoving = true
      this.player.isOrbiting = false
      this.spaceship.isOrbiting = false
      this.player.address.push(0)
      this.spaceship.address.push(0)
      this.area = this.planet.areas[0]
      this.setAlert("alert-info",`Initializing landing procedure...`)
      this.jumbotron.image = "img/atmosphere-entry.gif"
      var self = this
      let callback = function(){
        self.spaceship.isMoving = false
        self.spaceship.isOrbiting = false
        self.player.isOrbiting = false
        self.player.isLanded = true
        self.setAlert("alert-info",`Planetary landing successful.`)
        self.jumbotron.image = "img/spaceship-interior.2.jpg"
        self.jumbotron.title = `Spaceship Interior`
        self.jumbotron.description = `${self.planet.name} Planetary landing was successfully`
      }
      var start = Date.now()
      var duration = 5000
      var tick = function(){
        let progress = Date.now() - start
        if(progress < duration) {
          self.progressBar.percent = (progress / duration) * 100 
          requestAnimationFrame(tick)
        } else {
          callback()
          self.progressBar.percent = 0
        } 
      }
      requestAnimationFrame(tick)
    },
    progressAnimation: function(duration, update = null, callback = null) {
      var self = this
      var startTime = Date.now()
      let loop = setInterval(function() {
        let timer = Date.now() - startTime
        if(timer >= duration) {
          clearInterval(loop)
          callback()
        } else if(update) {
          if(update()==false) {
            clearInterval(loop)
          }
        }
      }, 1000/60)
    },
    selectPlanet: function(planetId){
      this.targetPlanet = planetId
    },
    setAlert: function(type, message) {
      this.starsystem.alert.type = type
      this.starsystem.alert.message = message
    },
    scanArea: function(id) {
      var player = this.player
      var area = this.area
      var planet = this.planet
      player.isScanning = true
      this.scanner.title = `Scanning area...`
      var self = this
      let callback = function(){
        area.scanned = true
        player.isScanning = false
        self.area.scannedPercent = 0
        self.progressBar.percent = 0
        self.setAlert(`alert-success`,`Scan complete! ${self.area.carbon.amount} carbon, ${self.area.minerals.amount} minerals`)
        self.area.title = `Sector ${self.area.id}`
        self.area.description = `The data your scanner revealed this area had ${area.carbon.amount.toFixed()} carbon and ${area.minerals.amount.toFixed()} minerals. Downloaded the data to the maps and marked this area as Sector ${area.id}.`
        self.jumbotron.title = self.area.title
        self.jumbotron.description = self.area.description
        if(self.spaceship.address[2] === self.area.id) {
          self.jumbotron.description += ` There is a spaceship parked in the area.`
        }
      }
      var start = Date.now()
      var duration = 5000
      var tick = function(){
        let progress = Date.now() - start
        if(progress < duration) {
          self.player.energy.amount -= 1/60
          //check if dead
          if(self.player.energy.amount <= 0) {
            self.gameover()
            return
          }
          self.area.scannedPercent = (progress / 5000)*100
          self.progressBar.percent = (progress / duration) * 100 
          requestAnimationFrame(tick)
        } else {
          callback()
          self.spaceship.progress.travel = 0
        } 
      }
      requestAnimationFrame(tick)
    },
    explore: function(direction) {
      this.progressBar.show = true
      this.progressBar.icon = "fa-hiking"
      this.setAlert("alert-info","Exploring new sector...")
      var self = this
      var planet = this.planet
      var area = this.area
      var player = this.player
      planet.alert.message = null
      player.isMoving = true
      let targetArea = area.id + direction
      if(targetArea < 0) {
        targetArea = planet.areas.length - 1
      }
      if(targetArea >= planet.areas.length) {
        targetArea = 0
      }
      
      var callback = function() {
        self.area = planet.areas[targetArea]
        self.jumbotron.image = self.area.image
        self.jumbotron.title = self.area.title
        self.jumbotron.description = self.area.description
        if(!self.area.discovered) {
          self.setAlert("alert-success",`You entered an new area.`)
          area.discovered = true
        }
        self.progressBar.message = null
        self.progressBar.percent = 0
        self.player.isMoving = false
      }

      var start = Date.now()
      var duration = 5000
      var step = function(){
        let progress = Date.now() - start
        if(progress < duration) {
          self.player.energy.amount -= 1/60
          self.progressBar.percent = (progress / duration) * 100 
          if(self.player.energy.amount <=0){
            self.gameover()   
            return
          }
          requestAnimationFrame(step)
        } else {
          callback()
          self.spaceship.progress.travel = 0
          self.progressBar.percent = 0
        } 
      }
      requestAnimationFrame(step)
    },
    enterSpaceship: function() {
      
      var self = this
      var start = Date.now()
      var duration = 1000
      var step = function(){
        let progress = Date.now() - start
        if(progress < duration) {
          self.spaceship.progress.enter = (progress / duration) * 100 
          self.progressBar.percent = self.spaceship.progress.enter
          requestAnimationFrame(step)
        } else {
          self.player.ship = self.spaceship.id
          self.spaceship.progress.enter = 0
          
          self.jumbotron.image = "img/spaceship-interior.2.jpg"
          self.progressBar.percent = 0
          self.jumbotron.title = `Spaceship Interior`
          if(self.player.energy.amount < self.player.energy.max) {
            self.setAlert("alert-info", `Wirelessly charging...`)
          }
          if(self.spaceship.fuel < 5) {
            self.jumbotron.description = `Your spaceship is low on fuel and not enough for launch. Fuel level at ${((self.spaceship.fuel/self.spaceship.fuelMax)*100).toFixed()} percent. You can craft fuel from carbon. You can find carbon by scanning areas.`
          } else {
            self.jumbotron.description = `Your spaceship is ready for launch. Fuel level at ${((self.spaceship.fuel/self.spaceship.fuelMax)*100).toFixed()} percent.`
          }
          
        }
        
      }
      requestAnimationFrame(step)
    },
    exitSpaceship: function(){      
      var self = this
      var start = Date.now()
      var duration = 1000
      var step = function(){
        let progress = Date.now() - start
        if(progress < duration) {
          self.spaceship.progress.exit = (progress / duration) * 100 
          self.progressBar.percent = self.spaceship.progress.exit
          requestAnimationFrame(step)
        } else {
          self.player.ship = null
          self.spaceship.progress.exit = 0
          self.progressBar.percent = 0
          self.setAlert("alert-success",`You exited the ship.`)
          self.jumbotron.image = self.area.image
          self.jumbotron.title = self.area.title
          self.jumbotron.description = self.area.description
        } 
      }
      requestAnimationFrame(step)
    },
    selectSpaceship: function(){
      this.spaceship.active = "active"
    },
    startMiningCarbon: function(){
        console.log("started mining")
      this.miningCarbon = true
    },
    stopMiningCarbon: function(){
        console.log("stopped mining")
      this.miningCarbon = false
    },
    mineCarbon: function(){
      if(this.area.carbon.amount > 0 && this.miningCarbon && this.player.inventory.carbon.amount < this.player.inventory.carbon.max) {
        this.player.energy.amount -= 1/60
        this.area.carbon.amount -= 1/60
        this.player.inventory.carbon.amount += 1/60 
        if(this.player.energy.amount <= 0) {
           this.gameover()
        }
      } else {
        this.area.carbon.amount = 0
      }
    },
    clickMineCarbon: function(){
      if(this.area.carbon.amount > 0 && this.player.inventory.carbon.amount < this.player.inventory.carbon.max) {
        this.player.energy.amount -= 1
        if(this.player.energy.amount <= 0) {
           this.gameover()
        } else {
          this.area.carbon.amount -= 1
          this.player.inventory.carbon.amount += 1
        }
      }
    },
    mineMinerals(){
      if(this.area.minerals.amount > 0 && this.player.inventory.minerals.amount < this.player.inventory.minerals.max) {
        this.player.energy.amount -= 1
        if(this.player.energy.amount <= 0) {
           this.gameover()
        } else {
          this.area.minerals.amount -= 1
          this.player.inventory.minerals.amount += 1
        }
      }
    },
    craftFuel() {
      if(this.player.inventory.carbon.amount >= 10 && this.spaceship.fuel < this.spaceship.fuelMax) {
        this.player.inventory.carbon.amount -= 10
        this.spaceship.fuel++
        this.setAlert("alert-success", `You crafted 1 fuel from 10 carbon`)
      } else {
        this.setAlert("alert-warning", `Could not craft fuel. Make sure you have carbon and your fuel tank is not already full.`)
      }
    },
    gameover(){
      this.jumbotron.image = "img/gameover.2.gif"
      if(this.player.energy.amount <= 0) {
        this.setAlert("alert-danger", `You died from running out of power. Game over.`)
      } else {
        this.setAlert("alert-danger", `You died. Game over.`)
      }
      
      this.player.energy.amount = 0
      this.isGameover = true
    }
  }
})