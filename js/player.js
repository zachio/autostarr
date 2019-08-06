autostarr.vue.data.player = {
  address:[],
  vehicle : null,
  starDistance : 0,
  isMoving : false,
  isOrbiting : false,
  isLanded : true,
  ship : null,
  isMining : false,
  energy : {
    amount: 1,
    max: 100
  },
  storage: {
    amount: 100,
    max: 100
  },
  inventory : {
    carbon: {
      name: "Carbon",
      item: "carbon",
      icon: "fa-tree",
      amount: 50
    },
    minerals: {
      name: "Minerals",
      item: "minerals",
      icon: "fa-mountain",
      amount: 49,
    },
    rover: {
      name: "Rover",
      item: "rover",
      icon: "fa-truck-pickup",
      amount: 1,
      install: "roverInstall"
    },
  },
  rover : false,
  screen: false,
  scanner: {
    title: "Scan",
    percent: 0,
    scanning: false,
  },
  mining: {
    carbon: false,
    minerals: false
  },
  orbit: null
}

autostarr.vue.methods.playerScan = function(id) {
  let player = this.player
  let area = this.area
  let planet = this.planet
  const progress = this.progress
  let explore = this.explore
  let spaceship = this.spaceship
  let self = this
  player.scanner.scanning = true
  explore.jumbotron.title = `Scanning area...`
  let callback = function() {
    area.scanned = true
    player.scanner.scanning = false
    player.scanner.percent = 0
    progress.percent = 0
    self.exploreSetAlert(`alert-success`, `Scan complete! ${area.resources.carbon.amount} carbon, ${area.resources.minerals.amount} minerals`)
    area.title = `${planet.name} ${area.id}`
    area.description = `The data your scanner revealed this area had ${area.resources.carbon.amount.toFixed()} carbon and ${area.resources.minerals.amount.toFixed()} minerals. Downloaded the data to the maps and marked this area as ${area.title}.`
    explore.jumbotron.title = area.title
    explore.jumbotron.description = area.description
    if (spaceship.address[2] === area.id) {
      explore.jumbotron.description += ` There is a spaceship parked in the area.`
    }
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
  let rover = this.rover
  let explore = this.explore
  let starsystem = this.starsystem
  let player = this.player
  let spaceship = this.spaceship
  let progress = this.progress
  //calculate trip duration and check rover for fuel
  var duration = 5000
  this.exploreSetAlert("alert-info", "Traveling to another area...", "fa-hiking")
  var self = this
  var planet = starsystem.planets[this.planet.id]
  player.isMoving = true
  let targetArea = this.area.id + direction
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
        self.area = planet.areas[targetArea]
        self.exploreSetAlert("alert-info", `You arrived at ${self.area.title}`, "fa-truck-pickup")
       } else {
         planet.areas[targetArea] = new Area(self.starsystem.id, planet.id, targetArea)
         self.area = planet.areas[targetArea]
         self.exploreSetAlert("alert-info", `You arrived at an unknown area`, "fa-truck-pickup")
       }
    if (targetArea === spaceship.address[2]) {
      explore.jumbotron.image = "img/spaceship-landed.jpg"
    } else {
      explore.jumbotron.image = self.area.image
    }
    explore.jumbotron.title = self.area.title
    explore.jumbotron.description = self.area.description
    if (!self.area.discovered) {
      self.exploreSetAlert("alert-success", `You entered an undiscovered area.`)
      self.area.discovered = true
    }
    player.isMoving = false
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
  if(this[from].inventory.batteries.amount && this.player.energy.amount < this.player.energy.max){
    this[from].inventory.batteries.amount--
    this[from].storage.amount--
    this.player.energy.amount++
  }
}