class Game {

    constructor() {
      var data = null
      if (localStorage.getItem("autostarr")) {
        data = JSON.parse(localStorage.autostarr)
      } else {
        data = {
          version: 33,
          autoSave: true,
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
          busy: false
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
          var self = this
          this.lastTick = Date.now()
          var now = Date.now()
          var tick = function() {
            //mine carbon
            if (self.miningCarbon) {
              self.mineCarbon()
              if (self.player.energy.amount <= 0) {
                self.gameover()
                return
              }
            }
  
            //recharge energy
            if (self.player.ship && self.player.energy.amount < self.player.energy.max) {
              self.player.energy.amount += 1 / 60
            }
            self.lastTick = now
            requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          if (this.autoSave) {
            setInterval(function() {
              self.save(self._data)
            }, 1000)
          }
        },
        methods: {
          launch: function() {
            if (this.spaceship.fuel >= 5) {
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
              var start = Date.now()
              this.spaceship.travel.distance = 5000
              var now = Date.now()
              var lastTick = Date.now()
              var tick = function() {
                let progress = Date.now() - start
                if (progress < self.spaceship.travel.distance) {
                  //consume fuel
                  now = Date.now()
                  self.spaceship.fuel -= 1 / (1000 / (now - lastTick))
                  if (self.spaceship.fuel <= 0) {
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
          land: function(planet) {
            this.spaceship.isMoving = true
            this.player.isOrbiting = false
            this.spaceship.isOrbiting = false
            let areaId = Math.floor((Math.random() * this.astroObject.size - 1))
            this.player.address.push(areaId)
            this.spaceship.address.push(areaId)
            this.area = this.astroObject.areas[areaId]
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
            var tick = function() {
              let progress = Date.now() - start
              if (progress < duration) {
                self.progressBar.percent = (progress / duration) * 100
                requestAnimationFrame(tick)
              } else {
                callback()
                self.progressBar.percent = 0
              }
            }
            requestAnimationFrame(tick)
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
                self.spaceship.fuel -= 1 / (1000 / (now - lastTick))
                if (self.spaceship.fuel <= 0) {
                  self.spaceship.fuel = 0
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
            this.alert.type = type
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
              self.area.title = `Sector ${self.area.id}`
              self.area.description = `The data your scanner revealed this area had ${area.carbon.amount.toFixed()} carbon and ${area.minerals.amount.toFixed()} minerals. Downloaded the data to the maps and marked this area as Sector ${area.id}.`
              self.jumbotron.title = self.area.title
              self.jumbotron.description = self.area.description
              if (self.spaceship.address[2] === self.area.id) {
                self.jumbotron.description += ` There is a spaceship parked in the area.`
              }
            }
            var start = Date.now()
            var duration = 5000
            var tick = function() {
              let progress = Date.now() - start
              if (progress < duration) {
                self.player.energy.amount -= 1 / 60
                //check if dead
                if (self.player.energy.amount <= 0) {
                  self.gameover()
                  return
                }
                self.area.scannedPercent = (progress / 5000) * 100
                self.progressBar.percent = (progress / duration) * 100
                requestAnimationFrame(tick)
              } else {
                self.spaceship.progress.travel = 0
                callback()
              }
            }
            requestAnimationFrame(tick)
          },
          explore: function(direction) {
            this.progressBar.icon = "fa-hiking"
            this.setAlert("alert-info", "Exploring new sector...")
            var self = this
            var planet = this.astroObject
            var area = this.area
            var player = this.player
            planet.alert.message = null
            player.isMoving = true
            let targetArea = area.id + direction
            if (targetArea < 0) {
              targetArea = planet.areas.length - 1
            }
            if (targetArea >= planet.areas.length) {
              targetArea = 0
            }
            player.address[2] = targetArea
            var callback = function() {
              self.area = planet.areas[targetArea]
              if (targetArea === self.spaceship.address[2]) {
                self.jumbotron.image = "img/spaceship-landed.jpg"
              } else {
                self.jumbotron.image = self.area.image
              }
              self.jumbotron.title = self.area.title
              self.jumbotron.description = self.area.description
              if (!self.area.discovered) {
                self.setAlert("alert-success", `You entered an new area.`)
                area.discovered = true
              }
              self.progressBar.percent = 0
              self.player.isMoving = false
            }
  
            var start = Date.now()
            var duration = 5000
            var step = function() {
              let progress = Date.now() - start
              if (progress < duration) {
                self.player.energy.amount -= 1 / 60
                self.progressBar.percent = (progress / duration) * 100
                if (self.player.energy.amount <= 0) {
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
            var step = function() {
              let progress = Date.now() - start
              if (progress < duration) {
                self.spaceship.progress.enter = (progress / duration) * 100
                self.progressBar.percent = self.spaceship.progress.enter
                requestAnimationFrame(step)
              } else {
                self.player.ship = self.spaceship.id
                self.spaceship.progress.enter = 0
  
                self.jumbotron.image = "img/spaceship-interior.3.gif"
                self.progressBar.percent = 0
                self.jumbotron.title = `Spaceship Interior`
                if (self.player.energy.amount < self.player.energy.max) {
                  self.setAlert("alert-info", `Wirelessly charging...`, "fa-bolt")
                }
                if (self.spaceship.fuel < 5) {
                  self.jumbotron.description = `Your spaceship is low on fuel and not enough for launch. Fuel level at ${((self.spaceship.fuel/self.spaceship.fuelMax)*100).toFixed()} percent. You can craft fuel from carbon. You can find carbon by scanning areas.`
                } else {
                  self.jumbotron.description = `Your spaceship is ready for launch. Fuel level at ${((self.spaceship.fuel/self.spaceship.fuelMax)*100).toFixed()} percent.`
                }
              }
  
            }
            requestAnimationFrame(step)
          },
          exitSpaceship: function() {
            var self = this
            var start = Date.now()
            var duration = 1000
            var step = function() {
              let progress = Date.now() - start
              if (progress < duration) {
                self.spaceship.progress.exit = (progress / duration) * 100
                self.progressBar.percent = self.spaceship.progress.exit
                requestAnimationFrame(step)
              } else {
                self.player.ship = null
                self.spaceship.progress.exit = 0
                self.progressBar.percent = 0
                self.setAlert("alert-success", `You exited the ship.`)
                self.jumbotron.image = "img/spaceship-landed.jpg"
                self.jumbotron.title = self.area.title
                self.jumbotron.description = self.area.description
              }
            }
            requestAnimationFrame(step)
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
            if (this.player.inventory.carbon >= 10 && this.spaceship.fuel < this.spaceship.fuelMax) {
              var self = this
              this.busy = true
              this.progressBarAnimation(Date.now(), 1000, function() {
                self.player.inventory.carbon -= 10
                self.player.inventory.amount -= 10
                self.spaceship.fuel++
                  self.setAlert("alert-success", `You crafted 1 fuel from 10 carbon`)
                self.busy = false
              })
  
            } else {
              this.setAlert("alert-warning", `Could not craft fuel. Make sure you have carbon and your fuel tank is not already full.`)
            }
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
            localStorage.setItem("autostarr", JSON.stringify(data))
          },
          reset() {
            //Initialize game
            let starId = 3
            this.starsystem = new StarSystem(starId)
            let astroId = Math.floor((Math.random() * this.starsystem.astronomicalObjects.length))
            if(astroId === 0) {
              astroId = 1
            }
            this.astroObject = this.starsystem.astronomicalObjects[astroId]
            this.targetPlanet = astroId
            this.currentOrbit = astroId
            console.log(astroId)
            let areaId = Math.floor((Math.random() * this.astroObject.size - 1))
            this.area = this.astroObject.areas[areaId]
            this.player = new Player(1, [starId, astroId, areaId])
            this.spaceship = new SpaceShip(1, [starId, astroId, areaId])
            this.spaceship.travel.targetPlanet = this.astroObject
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
          progressBarAnimation(start, duration, callback = null, update = null) {
            var self = this
            var tick = function() {
              let progress = Date.now() - start
              if (progress < duration) {
                self.progressBar.percent = (progress / duration) * 100
                if (update) {
                  update()
                }
                requestAnimationFrame(tick)
              } else {
                if (callback) {
                  callback()
                }
                self.progressBar.percent = 0
              }
            }
            requestAnimationFrame(tick)
          }
        }
      }
      this.vue = new Vue(this.state)
    }
  }
