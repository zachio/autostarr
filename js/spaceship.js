//Spaceship

class SpaceShip {
  constructor(starId=null,planetId=null,areaId=null) {
      this.address=[starId,planetId,areaId]
      this.pilot=null
      this.fuel = {
        amount: 0,
        max: 100,
        antimatter: {
          max: 100,
          amount: 0
        }
      }
      this.storage = {
        amount: 500,
        max: 1000
      }
      this.inventory = {
        carbon: {
          name: "Carbon",
          item: "carbon",
          icon: "fa-tree",
          amount: 250
        },
        minerals: {
          name: "Minerals",
          item: "minerals",
          icon: "fa-mountain",
          amount: 250
        },
      }
      this.speed = 1
      this.area = null
      this.travel = {
        start: Date.now(),
        distance: 0,
        direction: 1,
        targetPlanet: null
      }
      this.isMoving = false
      if(typeof this.address[2] != 'undefined') {
        this.area = this.address[2]
      }
      this.active = null
      let engineNoise = new Audio()
      engineNoise.src = "audio/spaceship.mp3"
      this.engineNoise = engineNoise
      this.engineNoise.loop = true
      this.landingSound = new Audio()
      this.landingSound.src = "audio/landing.mp3"
      this.target = null
      this.direction = 0
  }
}

autostarr.spaceship = {
  engineNoise: new Audio(),
  craft: {
      antimatter: function() {
        if (this.player.inventory.minerals >= 10 && this.spaceship.fuel.antimatter.amount < this.spaceship.fuel.antimatter.max) {
          var self = this
          this.busy = true
          var vehicle = this.spaceship
          this.progressBarAnimation(Date.now(), 5000, function() {
            self.player.inventory.minerals -= 10
            self.player.inventory.amount -= 10
            vehicle.fuel.antimatter.amount++
            self.setAlert("alert-success", `You crafted 1 anti-matter fuel from 10 minerals`)
            self.busy = false
          })
        } else {
          this.setAlert("alert-warning", `Could not craft fuel. Make sure you have enough minerals and your fuel tank is not already full.`,"fa-gas-pump")
        }
       }
    }
} 

//Methods
autostarr.vue.methods.spaceshipEnter = function() {
  let spaceship = autostarr.spaceship
  spaceship.engineNoise.volume = 0
  var duration = 1000

  let update = function() {
    if(spaceship.engineNoise.volume < 1) 
      spaceship.engineNoise.volume += 0.01
  }
  let self = this
  var callback = function() {
    self.player.ship = true
    self.explore.jumbotron.image = "img/spaceship-interior.3.gif"
    self.explore.jumbotron.title = `Spaceship Interior`
    if (self.player.energy.amount < self.player.energy.max) {
      self.exploreSetAlert("alert-info", `Wirelessly charging...`, "fa-bolt")
    }
    if (self.spaceship.fuel.amount < 5) {
      self.explore.jumbotron.description = `Your spaceship is low on fuel and not enough for launch. Fuel level at ${((self.spaceship.fuel.amount/self.spaceship.fuel.max)*100).toFixed()} percent. You can craft fuel from carbon. You can find carbon by scanning areas.`
    } else {
      self.explore.jumbotron.description = `Your spaceship is ready for launch. Fuel level at ${((self.spaceship.fuel.amount/self.spaceship.fuel.max)*100).toFixed()} percent.`
    }
  }
  self.progressAnimation(Date.now(),duration,callback, update)
}

autostarr.vue.methods.spaceshipExit = function() {
  let spaceship = autostarr.spaceship
  let progress = autostarr.progress
  let self = this
  let update = function(){
    if(spaceship.engineNoise.volume > 0.01) {
      spaceship.engineNoise.volume -= 0.01
    } else {
      spaceship.engineNoise.volume = 0
    }
  }
 
  var callback = function() {
    self.player.ship = null
    self.progress.percent = 0
    self.exploreSetAlert("alert-success", `You exited the ship.`)
    self.explore.jumbotron.image = "img/spaceship-landed.jpg"
    self.explore.jumbotron.title = self.area.title
    self.explore.jumbotron.description = self.area.description
  }
  self.progressAnimation(Date.now(),1000, callback, update)
}

autostarr.vue.methods.spaceshipLaunch = function() {
  let spaceship = this.spaceship
  let player = this.player
  let explore = this.explore
  let planet = this.planet
  let starsystem = this.starsystem
  let progress = autostarr.progress
  let self = this
  if (spaceship.fuel.amount >= 5) {
    spaceship.isMoving = true
    player.isLanded = false
    player.isOrbiting = false
    //Launch from planet
    explore.jumbotron.image = "img/rocket-launch.gif"
    self.exploreSetAlert(`alert-info`, `Initializing launch...`, "fa-rocket")
    let callback = function() {
      player.isLanded = false
      player.isOrbiting = true
      player.address.pop()
      player.starDistance = planet.starDistance
      spaceship.isMoving = false
      spaceship.isOrbiting = true
      spaceship.address = [starsystem.id, planet.id]
      explore.jumbotron.image = planet.image
      if (!planet.scanned) {
        self.exploreSetAlert("alert-success", `You successfully entered an unknown planets orbit.`)
        explore.jumbotron.title = `Orbiting Unknown Planet`
        explore.jumbotron.description = `Scan the planet to collect data about the planet and discover other planets as well.`
      } else {
        self.exploreSetAlert("alert-success", `You successfully entered ${planet.name}'s orbit.`)
        explore.jumbotron.title = `Orbiting ${planet.title}`
        explore.jumbotron.description = planet.description
      }
    }
    var update = function() {
      //consume fuel
      spaceship.fuel.amount -= 1/60
      if (spaceship.fuel.amount <= 0) {
        spaceship.fuel.amount = 0
        return false
      }
    }
    self.progressAnimation(Date.now(), 5000, callback, update)
  } else {
    this.exploreSetAlert("alert-warning", `Not enough fuel for launch!`)
  }
}

autostarr.vue.methods.spaceshipLand = function() {
  let player = this.player
  let planet = this.planet
  let starsystem = this.starsystem
  let explore = this.explore
  let spaceship = this.spaceship
  let progress = autostarr.progress
  player.isMoving = true
  player.isOrbiting = false
  spaceship.isOrbiting = false
  let areaId = Math.floor((Math.random() * planet.size - 1))
  player.address.push(areaId)
  spaceship.address.push(areaId)
  if(!planet.areas[areaId]) {
    planet.areas[areaId] = new Area(starsystem.id, planet.id, areaId)
  }
  this.area = planet.areas[areaId]
  console.log(spaceship.address, player.address, planet.areas[areaId], this.area)
  this.exploreSetAlert("alert-info", `Initializing landing procedure...`)
  explore.jumbotron.image = "img/atmosphere-entry.gif"
  var self = this
  let callback = function() {
    spaceship.isMoving = false
    spaceship.isOrbiting = false
    player.isOrbiting = false
    player.isLanded = true
    player.isMoving = false
    self.exploreSetAlert("alert-success", `Planetary landing successful.`)
    explore.jumbotron.image = "img/spaceship-interior.3.gif"
    explore.jumbotron.title = `Spaceship Interior`
    explore.jumbotron.description = `${planet.name} Planetary landing was successfully`
  }
  var start = Date.now()
  var duration = 5000
  self.progressAnimation(start, duration, callback)
}

autostarr.vue.methods.spaceshipScan = function() {
    let player = this.player
    let explore = this.explore
    let progress = this.progress
    let starsystem = this.starsystem
    let planet = this.planet
    var self = this
    let i = 0
    let astroObjectCount = starsystem.planets.length
    player.scanner.scanning = true
    this.exploreSetAlert("alert-info", "Scanning star system...")
    progress.percent = 0

    var loop = setInterval(function() {
      if (i >= astroObjectCount) {
        player.scanner.scanning = false
        self.exploreSetAlert("alert-success", `Scan Complete. You discovered ${starsystem.planetTotal} planets and 1 star!`)
        progress.percent = 0
        clearInterval(loop)
      } else {
        starsystem.planets[i++].scanned = true
        player.scanner.percent,
        progress.percent = (i / astroObjectCount) * 100
        explore.jumbotron.title = `Orbiting ${planet.name}`
        explore.jumbotron.description = planet.description
        starsystem.scanned = true
      }
    }, 500)
  }

autostarr.vue.methods.spaceshipTravelStar = function(direction){
  let spaceship = this.spaceship
  let starsystem = this.starsystem
  let explore = this.explore
  let planet = this.planet
  let player = this.player
  let progress = autostarr.progress
  if(spaceship.fuel.antimatter.amount >= 50) {
    spaceship.isMoving = true
    let id = starsystem.id + direction
    let star = this.stars[id]
    if(!star){
      star = new StarSystem(id)
    } 
    this.starsystem = star
    player.isOrbiting = false
    player.orbit = false
    spaceship.isMoving = true
    this.exploreSetAlert("alert-info",`Anti-matter traveling to ${this.starsystem.name}`,'fa-rocket')
    explore.jumbotron.image = "img/warp.gif"
    explore.jumbotron.title = `Destination System: ${this.starsystem.name}`
    explore.jumbotron.description = `Traveling to ${this.starsystem.name}...`
    var self = this
    let update = function(){
      spaceship.fuel.antimatter.amount -= 1/60
      if(spaceship.fuel.antimatter.amount <= 0) {
        self.gameover()
        return false
      }
    }
    let callback = function(){
      planet = self.starsystem.planets[0]
      self.planet = planet
      player.isOrbiting = true
      player.address = [id,0]
      player.starDistance = planet.starDistance
      player.orbit = 0
      spaceship.isMoving = false
      spaceship.starDistance = planet.starDistance
      spaceship.address = [id,0]
      self.exploreSetAlert("alert-success", `Success! You've arrived at ${self.starsystem.name}!`, "fa-rocket")
      explore.jumbotron.image = self.planet.image
      explore.jumbotron.title = (self.planet.scanned) ? self.planet.name : `Unknown Planet`
      explore.jumbotron.description = (self.planet.scanned) ? self.planet.description : `Orbitting an unknown planet.`
    }
    self.progressAnimation(Date.now(), 60000, callback, update)
  } else {
    this.exploreSetAlert("alert-warning", `Not enough antimatter to travel neighboring star. Use minerals to craft at least 50 antimatter fuel at the star.`, "fa-atom")
  }  
}

autostarr.vue.methods.spaceshipTravelPlanet = function(planetId) {
  let player = this.player
  let explore = this.explore
  let starsystem = this.starsystem
  let spaceship = this.spaceship
  let progress = autostarr.progress
  let planet = this.planet
  let targetPlanet = starsystem.planets[planetId]
  let self = this
  this.spaceship.travel.targetPlanet = planetId
  this.spaceship.direction = 1
  console.log(targetPlanet, this.spaceship.travel.targetPlanet)
  if (targetPlanet.starDistance < player.starDistance) {
    this.spaceship.direction = -1
  }
  player.orbit = null
  spaceship.isMoving = true
  spaceship.isOrbiting = false
  player.isMoving = false
  player.isOrbiting = false

  //Travel to another planet
  explore.jumbotron.image = "img/warp.gif"
  explore.jumbotron.title = `Destination: ${targetPlanet.name} `
  explore.jumbotron.description = targetPlanet.description

  spaceship.travel.start = Date.now()
  spaceship.travel.distance = Math.abs(targetPlanet.starDistance - player.starDistance)
  var now = Date.now()
  var lastTick = Date.now()
  var tick = function() {
    let progress = Date.now() - spaceship.travel.start
    if (progress < spaceship.travel.distance) {
      self.exploreSetAlert("alert-info", `Traveled ${progress} distance.`, "fa-map-marker")
      //consume fuel
      now = Date.now()
      spaceship.fuel.amount -= 1 / (1000 / (now - lastTick))
      if (spaceship.fuel.amount <= 0) {
        spaceship.fuel.amount = 0
        autostarr.vue.methods.gameover()
        return false
      }
      progress.percent = (progress / spaceship.travel.distance) * 100
      //update player distance from star
      player.starDistance = planet.starDistance + progress * spaceship.travel.direction
      lastTick = now
      requestAnimationFrame(tick)
    } else {
      progress.percent = 0
      self.planet = targetPlanet
      player.address[1] = self.planet.id
      spaceship.address[1] = self.planet.id
      self.exploreSetAlert("alert-success", `Successfully arrived!`, "fa-rocket")
      explore.jumbotron.image = planet.image
      explore.jumbotron.title = (targetPlanet === -1) ? `Orbiting The ${targetPlanet.name} Star` : `Orbiting Planet ${planet.name}`
      explore.jumbotron.description = targetPlanet.description
      player.orbit = planet.id
      player.starDistance = targetPlanet.starDistance
      spaceship.isMoving = false
      spaceship.isOrbiting = true
      player.isOrbiting = true
    }
  }
  requestAnimationFrame(tick)
  console.log(targetPlanet)
}

autostarr.vue.methods.spaceshipRefuel = function(from){
  if(this.player.ship && this[from].inventory.shipFuelCells.amount && this.spaceship.fuel.amount < this.spaceship.fuel.max) {
    this[from].inventory.shipFuelCells.amount--
    this[from].storage.amount--
    this.spaceship.fuel.amount++
  }
  console.log("refuel spaceship")
}

autostarr.vue.methods.spaceshipRefuelAntimatter = function(from) {
  if(this.player.ship && this[from].inventory.antiMatterFuelCells.amount && this.spaceship.fuel.antimatter.amount < this.spaceship.fuel.antimatter.max) {
    this[from].inventory.antiMatterFuelCells.amount--
    this[from].storage.amount--
    this.spaceship.fuel.antimatter.amount++
  }
  console.log("antimatter fuel")
}