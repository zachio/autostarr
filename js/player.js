class Player {
  constructor() {
    this.address = []
    this.vehicle = null
    this.starDistance = 0
    this.isMoving = false
    this.isOrbiting = false
    this.isLanded = true
    this.ship = null
    this.isMining = false
    this.energy = {
      amount: 100,
      max: 100
    }
    this.storage = {
      amount: 1,
      max: 100
    }
    this.inventory  = {
      carbon: {
        name: "Carbon",
        item: "carbon",
        icon: "fa-tree",
        amount: 0
      },
      minerals: {
        name: "Minerals",
        item: "minerals",
        icon: "fa-mountain",
        amount: 0,
      },
      rover: {
        name: "Rover",
        item: "rover",
        icon: "fa-truck-pickup",
        amount: 1,
        install: "roverInstall"
      }
    }
    this.rover  = false,
    this.screen = false,
    this.scanner = {
      title: "Scan",
      percent: 0,
      scanning: false,
    }
    this.mining = {
      carbon: false,
      minerals: false
    }
    this.orbit = null
  }
}

autostarr.vue.methods.playerScan = function(id) {
  let player = this.autostarr.player
  let area = this.autostarr.area
  let planet = this.autostarr.planet
  const progress = this.progress
  let explore = this.autostarr.explore
  let spaceship = this.autostarr.spaceship
  let self = this
  player.scanner.scanning = true
  explore.jumbotron.title = `Scanning area...`
  let callback = function() {
    area.scanned = true
    area.discovered = true
    player.scanner.scanning = false
    player.scanner.percent = 0
    progress.percent = 0
    self.exploreSetAlert(`alert-success`, `Scan complete! ${area.resources.carbon.amount} carbon, ${area.resources.minerals.amount} minerals`, "fa-rss")
    area.title = `${planet.name} ${area.id}`
    area.description = `The data your scanner revealed this area had ${area.resources.carbon.amount.toFixed()} carbon and ${area.resources.minerals.amount.toFixed()} minerals. Downloaded the data to the maps and marked this area as ${area.title} in The ${self.autostarr.starsystem.name} System.`
    explore.jumbotron.title = area.title
    explore.jumbotron.description = area.description
    if (spaceship.address[2] === area.id) {
      explore.jumbotron.description += ` There is a spaceship parked in the area.`
    }
    planet.areas[area.id] = area
  }
  var start = Date.now()
  var duration = 5000
  var update = function() {
    player.energy.amount -= 1/60
    //check if dead
    if (player.energy.amount <= 0) {
      self.gameover()
      return false
    }
  }
  this.progressAnimation(start, duration, callback, update)
}

autostarr.vue.methods.playerExplore = function(direction) {
  let rover = this.autostarr.explore
  let explore = this.autostarr.explore
  let starsystem = this.autostarr.starsystem
  let player = this.autostarr.player
  let spaceship = this.autostarr.spaceship
  let progress = this.progress
  //calculate trip duration and check rover for fuel
  var duration = 5000
  let icon = "fa-hiking"
  this.exploreSetAlert("alert-info", "Traveling to another area...", icon)
  explore.jumbotron.image = "img/walking.gif"
  let self = this
  let planet = this.autostarr.planet
  player.isMoving = true
  this.busy = true
  let targetArea = this.autostarr.area.id + direction
  if (targetArea < 0) {
    targetArea = planet.size - 1
  }
  if (targetArea >= planet.size) {
    targetArea = 0
  }
  let callback = function() {
    player.address[2] = targetArea
    if(player.rover)
      rover.address[2] = targetArea
    if(planet.areas[targetArea]) {
        self.autostarr.area = planet.areas[targetArea]
        self.exploreSetAlert("alert-info", `You arrived at ${self.autostarr.area.title}`, "fa-map-marked")
       } else {
         planet.areas[targetArea] = new Area(self.autostarr.starsystem.id, planet.id, targetArea)
         self.autostarr.area = planet.areas[targetArea]
         self.exploreSetAlert("alert-info", `You arrived at an unknown area.`, "fa-question-circle")
       }
    if (targetArea === spaceship.address[2]) {
      explore.jumbotron.image = "img/spaceship-landed.jpg"
    } else {
      explore.jumbotron.image = self.autostarr.area.image
    }
    explore.jumbotron.title = self.autostarr.area.title
    explore.jumbotron.description = self.autostarr.area.description
    player.isMoving = false
    self.busy = false
  }
  let update = function() {
    if(player.rover) {
      rover.fuel.amount -= 1/60
      if (rover.fuel.amount <= 0) {
        rover.fuel.amount = 0
      }
    } else {
      player.energy.amount -= 1/60 
      if (player.energy.amount <= 0) {
        self.gameover()
        return false
      }
    }
  }
  this.progressAnimation(Date.now(), duration, callback, update)
}

autostarr.vue.methods.playerRecharge = function(from) {
  if(this[from].inventory.batteries.amount && this.autostarr.player.energy.amount < this.autostarr.player.energy.max){
    this[from].inventory.batteries.amount--
    this[from].storage.amount--
    self.autostarr.area.energy.amount++
  }
}
