export default class Game {

  constructor() {
    var data = null
    if (localStorage.getItem("autostarr")) {
      data = JSON.parse(localStorage.autostarr)
    } else {
      data = {
        isRegistered: false,
        version: `39`,
        autoSave: false,
        isLoading: true,
        loadingImage: "./img/loading.gif",
        currentOrbit: null,
        starsystem: null,
        player: null,
        spaceship: null,
        progressBar: {
          show: true,
          type: "progress-bar-info",
          percent: 0
        },
        jumbotron: {
          image: "img/loading.gif",
          title: null,
          description: null
        },
        planet: null,
        astroObject: null,
        alert: {
          show: false,
          icon: null,
          type: "alert-info",
          message: null
        },
        targetPlanet: null,
        area: null,
        miningCarbon: false,
        scanner: {
          title: "Scan",
          percent: 0
        },
        lastTick: null,
        isGameover: false,
        busy: false,
        rover: null,
        exploreIcon: "fa-hiking",
        stars: {},
        screens: {
          explore: false,
          exploreActive: null,
          crafting: false,
          craftingActive: null,
          player: false,
          playerActive: null,
          inventory: false,
          inventoryActive: null,
          spaceship: false,
          spaceshipActive: null,
          rover: false,
          roverActive: null
        }
      }
    }
    this.state = {
      el: "#app",
      data: data,
      created: function() {
        //Initialize game
        if (!localStorage.getItem("autostarr")) {
          this.reset()
        }
        this.screens.explore = true
        this.screens.exploreActive = "active"
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
        
      },
      methods: {
        launch: function() {
          if (this.spaceship.fuel.amount >= 5) {
            this.spaceship.isMoving = true
            this.player.isLanded = false
            //Launch from planet
            this.jumbotron.image = "img/rocket-launch.gif"
            this.setAlert(`alert-info`, `Initializing launch...`, "fa-rocket")
            var self = this
            let callback = function() {
              self.spaceship.isMoving = false
              self.player.isLanded = false
              self.player.isOrbiting = true
              self.spaceship.isOrbiting = true
              self.player.address.pop()
              self.spaceship.address = [self.starsystem.id, self.astroObject.id]
              self.jumbotron.image = self.astroObject.image
              if (!self.astroObject.scanned) {
                self.setAlert("alert-success", `You successfully entered an unknown planets orbit.`)
                self.jumbotron.title = `Orbiting Unknown Planet`
                self.jumbotron.description = `Scan the planet to collect data about the planet and discover other planets as well.`
              } else {
                self.setAlert("alert-success", `You successfully entered ${self.astroObject.name}'s orbit.`)
                self.jumbotron.title = `Orbiting ${self.astroObject.title}`
                self.jumbotron.description = self.astroObject.description
              }
            }
            var update = function() {
              //consume fuel
              self.spaceship.fuel.amount -= 1/60
              if (self.spaceship.fuel.amount <= 0) {
                self.spaceship.fuel.amount = 0
                return false
              }
            }
            this.progressBarAnimation(Date.now(), 5000, callback, update)
          } else {
            this.setAlert("alert-warning", `Not enough fuel for launch!`)
          }
        },
        land: function() {
          this.spaceship.isMoving = true
          this.player.isOrbiting = false
          this.spaceship.isOrbiting = false
          let areaId = Math.floor((Math.random() * this.astroObject.size - 1))
          this.player.address.push(areaId)
          this.spaceship.address.push(areaId)
          if(!this.planet.areas[areaId]) {
            this.planet.areas[areaId] = new Area(this.starsystem.id, this.planet.id, areaId)
          }
          this.area = this.planet.areas[areaId]
          this.setAlert("alert-info", `Initializing landing procedure...`)
          this.jumbotron.image = "img/atmosphere-entry.gif"
          var self = this
          let callback = function() {
            self.spaceship.isMoving = false
            self.spaceship.isOrbiting = false
            self.player.isOrbiting = false
            self.player.isLanded = true
            self.setAlert("alert-success", `Planetary landing successful.`)
            self.jumbotron.image = "img/spaceship-interior.3.gif"
            self.jumbotron.title = `Spaceship Interior`
            self.jumbotron.description = `${self.astroObject.name} Planetary landing was successfully`
          }
          var start = Date.now()
          var duration = 5000
          self.progressBarAnimation(start, duration, callback)
        },
        travel: function(planetId) {
          var player = this.player
          var jumbotron = this.jumbotron
          var self = this
          var targetPlanet = this.starsystem.astronomicalObjects[planetId]
          this.spaceship.travel.targetPlanet = targetPlanet
          this.spaceship.travel.direction = 1
          if (targetPlanet.starDistance < player.starDistance) {
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
          self.jumbotron.title = `Destination: ${targetPlanet.name} `
          self.jumbotron.description = targetPlanet.description

          this.spaceship.travel.start = Date.now()
          this.spaceship.travel.distance = Math.abs(targetPlanet.starDistance - this.player.starDistance)
          var now = Date.now()
          var lastTick = Date.now()
          var tick = function() {
            let progress = Date.now() - self.spaceship.travel.start
            if (progress < self.spaceship.travel.distance) {
              self.setAlert("alert-info", `Traveled ${progress} distance.`, "fa-map-marker")
              //consume fuel
              now = Date.now()
              self.spaceship.fuel.amount -= 1 / (1000 / (now - lastTick))
              if (self.spaceship.fuel.amount <= 0) {
                self.spaceship.fuel.amount = 0
                self.gameover()
                return
              }
              self.progressBar.percent = (progress / self.spaceship.travel.distance) * 100
              self.spaceship.progress.travel = (progress / self.spaceship.travel.distance) * 100
              //update player distance from star
              self.player.starDistance = self.astroObject.starDistance + progress * self.spaceship.travel.direction
              lastTick = now
              requestAnimationFrame(tick)
            } else {
              self.spaceship.progress.travel = 0
              self.progressBar.percent = 0
              self.astroObject = self.spaceship.travel.targetPlanet
              self.player.address[1] = self.astroObject.id
              self.setAlert("alert-success", `Successfully arrived!`, "fa-rocket")
              self.jumbotron.image = self.astroObject.image
              self.jumbotron.title = (targetPlanet === -1) ? `Orbiting The ${targetPlanet.name} Star` : `Orbiting Planet ${self.astroObject.name}`
              self.jumbotron.description = targetPlanet.description
              self.currentOrbit = self.astroObject.id
              self.player.starDistance = targetPlanet.starDistance
              self.spaceship.isMoving = false
              self.spaceship.isOrbiting = true
              self.player.isOrbiting = true
            }
          }
          requestAnimationFrame(tick)
        },
        scan: function() {
          let player = this.player
          player.isScanning = true
          this.setAlert("alert-info", "Scanning star system...")
          this.progressBar.percent = 0
          var self = this
          let i = 0
          let astroObjectCount = this.starsystem.astronomicalObjects.length
          var loop = setInterval(function() {
            if (i >= astroObjectCount) {
              self.player.isScanning = false
              self.setAlert("alert-success", `Scan Complete. You discovered ${self.starsystem.planetTotal} planets and 1 star!`)
              self.progressBar.percent = 0
              clearInterval(loop)
            } else {
              self.starsystem.astronomicalObjects[i++].scanned = true
              self.scanner.percent,
              self.progressBar.percent = (i / astroObjectCount) * 100
              self.jumbotron.title = `Orbiting ${self.astroObject.name}`
              self.jumbotron.description = self.astroObject.description
              self.starsystem.scanned = true
            }
          }, 500)
        },
        selectAstroObject: function(astroId) {
          this.targetPlanet = astroId
        },
        setAlert: function(type, message, icon = null) {
          this.alert.type = `${type} show` 
          this.alert.icon = icon
          this.alert.message = message
        },
        scanArea: function(id) {
          var player = this.player
          var area = this.area
          var planet = this.astroObject
          player.isScanning = true
          this.scanner.title = `Scanning area...`
          var self = this
          let callback = function() {
            area.scanned = true
            player.isScanning = false
            self.area.scannedPercent = 0
            self.progressBar.percent = 0
            self.setAlert(`alert-success`, `Scan complete! ${self.area.carbon.amount} carbon, ${self.area.minerals.amount} minerals`)
            self.area.title = `${self.planet.name} ${self.area.id}`
            self.area.description = `The data your scanner revealed this area had ${area.carbon.amount.toFixed()} carbon and ${area.minerals.amount.toFixed()} minerals. Downloaded the data to the maps and marked this area as ${self.area.title}.`
            self.jumbotron.title = self.area.title
            self.jumbotron.description = self.area.description
            if (self.spaceship.address[2] === self.area.id) {
              self.jumbotron.description += ` There is a spaceship parked in the area.`
            }
          }
          var start = Date.now()
          var duration = 5000
          var update = function() {
            self.player.energy.amount -= 1/60
            //check if dead
            if (self.player.energy.amount <= 0) {
              self.gameover()
              return
            }
          }
          this.progressBarAnimation(start,duration,callback, update)
        },
        exploreArea: function(direction) {
          //calculate trip duration and check rover for fuel
          var duration = 5000
          if(this.player.rover) {
            if(this.rover.fuel.amount <= 0) {
              this.setAlert("alert-warning", `Rover is out of fuel. Craft fuel with carbon inside the rover to fill the gas tank.`, "fa-truck-pickup")
              return
              } else {
                duration = duration / this.rover.speed
              }
            
            this.setAlert("alert-info", "Traveling to another area...", "fa-truck-pickup")
          } else {
            this.setAlert("alert-info", "Traveling to another area...", "fa-hiking")
          }
          
          var self = this
          var planet = this.astroObject
          var area = this.area
          var player = this.player
          player.isMoving = true
          let targetArea = area.id + direction
          if (targetArea < 0) {
            targetArea = planet.size - 1
          }
          if (targetArea >= planet.size) {
            targetArea = 0
          }
          var callback = function() {
            player.address[2] = targetArea
            if(player.rover)
              self.rover.address[2] = targetArea
            if(planet.areas[targetArea]) {
                self.area = planet.areas[targetArea]
                self.setAlert("alert-info", `You arrived at ${self.area.title}`, "fa-truck-pickup")
               } else {
                 planet.areas[targetArea] = new Area(self.starsystem.id, planet.id, targetArea)
                 self.area = planet.areas[targetArea]
                 self.setAlert("alert-info", `You arrived at an unknown area`, "fa-truck-pickup")
               }
            if (targetArea === self.spaceship.address[2]) {
              self.jumbotron.image = "img/spaceship-landed.jpg"
            } else {
              self.jumbotron.image = self.area.image
            }
            self.jumbotron.title = self.area.title
            self.jumbotron.description = self.area.description
            if (!self.area.discovered) {
              self.setAlert("alert-success", `You entered an undiscovered area.`)
              area.discovered = true
            }
            self.player.isMoving = false
          }
          var update = function() {
            if(self.player.rover) {
              self.rover.fuel.amount -= 1/60
              if (self.rover.fuel.amount <= 0) {
                self.rover.fuel = 0
              }
            } else {
              self.player.energy.amount -= 1/60 
              if (self.player.energy.amount <= 0) {
                self.gameover()
                return false
              }
            }
          }
          this.progressBarAnimation(Date.now(), duration, callback, update)
        },
        enterSpaceship: function() {
          this.spaceship.engineNoise.volume = 0
          var self = this
          var duration = 1000
          
          let update = function() {
            if(self.spaceship.engineNoise.volume < 1) 
              self.spaceship.engineNoise.volume += 0.01
          }
          var callback = function() {
            
            self.player.ship = self.spaceship.id
            self.jumbotron.image = "img/spaceship-interior.3.gif"
            self.jumbotron.title = `Spaceship Interior`
            if (self.player.energy.amount < self.player.energy.max) {
              self.setAlert("alert-info", `Wirelessly charging...`, "fa-bolt")
            }
            if (self.spaceship.fuel.amount < 5) {
              self.jumbotron.description = `Your spaceship is low on fuel and not enough for launch. Fuel level at ${((self.spaceship.fuel.amount/self.spaceship.fuel.max)*100).toFixed()} percent. You can craft fuel from carbon. You can find carbon by scanning areas.`
            } else {
              self.jumbotron.description = `Your spaceship is ready for launch. Fuel level at ${((self.spaceship.fuel.amount/self.spaceship.fuel.max)*100).toFixed()} percent.`
            }
          }
          this.progressBarAnimation(Date.now(),duration,callback, update)
        },
        exitSpaceship: function() {
          var self = this
          let update = function(){
            if(self.spaceship.engineNoise.volume > 0.01) {
              self.spaceship.engineNoise.volume -= 0.01
            } else {
              self.spaceship.engineNoise.volume = 0
            }
              
          }
          var callback = function() {
            self.player.ship = null
            self.spaceship.progress.exit = 0
            self.progressBar.percent = 0
            self.setAlert("alert-success", `You exited the ship.`)
            self.jumbotron.image = "img/spaceship-landed.jpg"
            self.jumbotron.title = self.area.title
            self.jumbotron.description = self.area.description
          }
          this.progressBarAnimation(Date.now(),1000, callback, update)
        },
        startMiningCarbon: function() {
          this.miningCarbon = true
        },
        stopMiningCarbon: function() {
          this.miningCarbon = false
        },
        mineCarbon: function() {
          if (this.area.carbon.amount > 0 && this.miningCarbon && this.player.inventory.amount < this.player.inventory.max) {
            this.player.energy.amount -= 1 / 60
            this.area.carbon.amount -= 1 / 60
            this.player.inventory.carbon += 1 / 60
            this.player.inventory.amount += 1 / 60
            if (this.player.energy.amount <= 0) {
              this.gameover()
            }
          } else {
            this.area.carbon.amount = 0
          }
        },
        clickMineCarbon: function() {
          if (this.area.carbon.amount > 0 && this.player.inventory.amount < this.player.inventory.max) {
            this.player.energy.amount -= 1
            if (this.player.energy.amount <= 0) {
              this.gameover()
            } else {
              this.area.carbon.amount -= 1
              this.player.inventory.carbon += 1
              this.player.inventory.amount += 1
            }
          }
        },
        removeCarbon() {
          if (this.player.inventory.carbon >= 1) {
            this.player.inventory.carbon--
              this.player.inventory.amount--
          } else {
            this.player.inventory.carbon = 0
          }
        },
        mineMinerals() {
          if (this.area.minerals.amount > 0 && this.player.inventory.amount < this.player.inventory.max) {
            this.player.energy.amount -= 1
            if (this.player.energy.amount <= 0) {
              this.gameover()
            } else {
              this.area.minerals.amount -= 1
              this.player.inventory.minerals += 1
              this.player.inventory.amount += 1
            }
          }
        },
        removeMinerals() {
          if (this.player.inventory.minerals >= 1) {
            this.player.inventory.minerals--
              this.player.inventory.amount--
          } else {
            this.player.inventory.minerals = 0
          }

        },
        craftFuel() {
          if (this.player.inventory.carbon >= 10 && this.spaceship.fuel.amount < this.spaceship.fuel.max) {
            var self = this
            this.busy = true
            var vehicle = this.spaceship
            this.progressBarAnimation(Date.now(), 1000, function() {
              self.player.inventory.carbon -= 10
              self.player.inventory.amount -= 10
              vehicle.fuel.amount++
              self.setAlert("alert-success", `You crafted 1 fuel from 10 carbon`)
              self.busy = false
            })

          } else {
            this.setAlert("alert-warning", `Could not craft fuel. Make sure you have carbon and your fuel tank is not already full.`)
          }
        },
        craftAntiMatterFuel() {
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
        },
        craftRover() {
          var self = this
          if(this.player.inventory.minerals >= 100) {
            this.setAlert("alert-info", `Crafting rover...`, "fa-truck")
            this.progressBarAnimation(Date.now(), 10000, function() {
              self.player.inventory.minerals -= 100
              self.player.inventory.amount -= 100
              self.setAlert("alert-success", `Successfully crafted a rover. Enter the rover and explore to travel twice as fast.`,'fa-truck-pickup')
              let address = self.player.address
              self.area.rovers.push(new Rover(address[0], address[1], address[2]))
            }, function(){
              self.player.energy.amount -= 1/60
              if(self.player.energy.amount <= 0) {
                self.gameover()
              }
            })
          } else {
            this.setAlert("alert-info", `Not enough minerals to craft a rover. A rover requires 100 minerals to craft.`,'fa-truck-pickup')
          }
        },
        craftRoverFuel(){
          if (this.player.inventory.carbon >= 5 && this.rover.fuel.amount < this.rover.fuel.max) {
            var self = this
            this.busy = true
            var vehicle = this.rover
            this.progressBarAnimation(Date.now(), 1000, function() {
              self.player.inventory.carbon -= 5
              self.player.inventory.amount -= 5
              vehicle.fuel.amount += 1
              self.setAlert("alert-success", `You crafted 1 fuel from 5 carbon for the rover.`, 'fa-truck-pickup')
              self.busy = false
            })

          } else {
            this.setAlert("alert-warning", `Could not craft fuel. Make sure you have carbon and your fuel tank is not already full.`)
          }
        },
        enterRover(id){
          var self = this
          this.progressBarAnimation(Date.now(), 1000, function(){
            self.player.rover = true
            self.exploreIcon = "fa-truck-pickup"
            self.progressBar.percent = 0
            self.setAlert("alert-info","Entered the rover")
            let i = id - 1
            self.rover = self.area.rovers[i]
            self.area.rovers.splice(i, 1)
          })
        },
        exitRover() {
          var self = this
          this.progressBarAnimation(Date.now(), 1000, function(){
            self.player.rover = false
            self.exploreIcon = "fa-hiking"
            self.progressBar.percent = 0
            self.setAlert("alert-info","Exited rover")
            self.area.rovers.push(self.rover)
          })
        },
        roverFuelPercent(){
          if(this.rover) {
            return `${((this.rover.fuel.amount / this.rover.fuel.max) * 100)}%`
          }
        },
        roverFuelLevel(){
          if(this.rover)
            return `${this.rover.fuel.amount.toFixed()} / ${this.rover.fuel.max}`
        },
        gameover() {
          this.jumbotron.image = "img/gameover.2.gif"
          if (this.player.energy.amount <= 0) {
            this.setAlert("alert-danger", `You died from running out of power. Game over.`)
          } else {
            this.setAlert("alert-danger", `You died. Game over.`)
          }
          this.player.energy.amount = 0
          this.isGameover = true
        },
        save(data) {
          var self = this
          this.setAlert("alert-warning",`Do not turn your console off while saving in progress.`,"fa-disk")
          this.progressBarAnimation(Date.now(), 3000, function(){
            self.setAlert("alert-success", `Save complete! :)`, "fa-disk")
            localStorage.setItem("autostarr", JSON.stringify(data))
          })
          
        },
        reset() {
          //Initialize game
          let starId = 3
          this.stars[starId] = new StarSystem(starId)
          this.starsystem = this.stars[starId]
          let astroId = Math.floor((Math.random() * this.starsystem.planets.length))
          this.astroObject = this.starsystem.planets[astroId]
          this.planet = this.astroObject
          this.targetPlanet = astroId
          this.currentOrbit = astroId
          let areaId = Math.floor((Math.random() * this.astroObject.size - 1))
          this.area = new Area(starId, astroId, areaId)
          this.planet.areas[areaId] = this.area
          this.player = new Player(1, [starId, astroId, areaId])
          this.rover = new Rover(starId, astroId, areaId)
          this.spaceship = new SpaceShip(1, starId, astroId, areaId)
          this.spaceship.travel.targetPlanet = this.astroObject
          this.spaceship.engineNoise.volume = 0
          this.spaceship.engineNoise.play()
          this.player.starDistance = this.astroObject.starDistance
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
          this.progressBar.percent = 0
          this.isGameover = false
          jumboImg.addEventListener("load", function() {
            self.isLoading = false
            self.setAlert("alert-danger", `Danger! Power levels are critically low. Find a charging station immediately.`, "fa-bolt")
            self.jumbotron.image = "img/spaceship-landed.jpg"
            self.jumbotron.title = "Unknown Area"
            self.jumbotron.description = `You awake on an alien planet. It appears your memory was corrupted and you have no record of how you got here. You are only familiar with the spaceship landed on the ground in the area.`
          })
        },
        hardReset() {
          if(confirm("Are you sure you want to restart? All progress will be lost.")){
            this.autoSave = false
            localStorage.clear()
            location.reload()
          }  
        },
        progressBarAnimation(start, duration, callback = null, update = null) {
          var self = this
          self.progressBar.percent = 0
          var interval = function() {
            let progress = Date.now() - start
            if (progress < duration) {
              self.progressBar.percent = (progress / duration) * 100
              if (update) {
                if(update() == false) {
                  return
                }
              }
              requestAnimationFrame(interval)
            } else {
              if (callback) {
                callback()
                self.progressBar.percent = 0
              }
            }
          }
          requestAnimationFrame(interval)
        },
        moveInventory(item, from, to) {
          if(this[from].inventory[item] >= 1 && this[to].inventory.amount < this[to].inventory.max) {
            this[from].inventory[item]--
            this[from].inventory.amount--
            this[to].inventory[item]++
            this[to].inventory.amount++
          }
        },
        starNeighborName(direction){
          let id = this.starsystem.id + direction
          let star = new StarSystem(id)
          return star.name
        },
        travelToStar(direction){
          if(this.spaceship.fuel.antimatter.amount >= 50) {
            this.spaceship.isMoving = true
            let id = this.starsystem.id + direction
            let star = this.stars[id]
            if(star){
              this.starsystem = star
            } else {
              star = new StarSystem(id)
              this.starsystem = star
            }
            this.jumbotron.image = "img/warp.gif"
            this.jumbotron.title = `Destination System: ${this.starsystem.name}`
            this.jumbotron.description = `Traveling to ${this.starsystem.name}...`
            var self = this
            let update = function(){
//               self.spaceship.fuel.antimatter.amount -= 1/60
            }
            let callback = function(){
              self.spaceship.isMoving = false
              self.spaceship.fuel.antimatter.amount -= 50
              self.astroObject = self.starsystem.astronomicalObjects[0]
              self.setAlert("alert-success", `Success! You've arrived at ${self.starsystem.name}!`, "fa-sun")
              self.spaceship.address[0] = id
              self.player.address[0] = id
              self.jumbotron.image = "img/sun.jpg"
              self.jumbotron.title = self.starsystem.astronomicalObjects[0].name
              self.jumbotron.description = self.starsystem.astronomicalObjects[0].description
            }
            this.progressBarAnimation(Date.now(), 60000, callback, update)
          } else {
            this.setAlert("alert-warning", `Not enough antimatter to travel neighboring star. Use minerals to craft at least 50 antimatter fuel at the star.`, "fa-atom")
          }  
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
        resetScreen(){
          for(var screen in this.screens) {
            screen = false
          }
        }
        
      }
    }
    this.vue = new Vue(this.state)
  }
}