'use strict'

 class Rover { 
   constructor(starid, planetid, areaid) {
    this.address = [starid, planetid, areaid]
    let planet = new Planet(starid, planetid)
    let area = new Area(starid, planetid, areaid)
    this.alias = `The ${planet.name} ${area.id} Rover`
    this.storage = {
      amount: 0,
      max: 500
    }
    this.inventory= {}
    this.player = null
    this.starsystem = null
    this.speed = 5
    this.fuel = {
      amount: 100,
      max: 100
    }
  }
}

autostarr.vue.methods.roverEnter = function(index) {
  this.autostarr.rover = this.autostarr.area.rovers[index]
  this.autostarr.area.rovers.splice(index, 1)
  this.autostarr.player.rover = true
}

autostarr.vue.methods.roverExit = function() {
  this.autostarr.area.rovers.push(this.autostarr.rover)
  this.autostarr.rover = null
  this.autostarr.player.rover = false
}

autostarr.vue.methods.roverRefuel = function(from) {
  if(this.autostarr.player.rover && this.autostarr[from].inventory.roverFuelCells.amount > 0 && this.autostarr.rover.fuel.amount < this.autostarr.rover.fuel.max){
    this.autostarr[from].inventory.roverFuelCells.amount--
    this.autostarr.area.storage.amount--
    this.autostarr.rover.fuel.amount++
  }
  console.log("refuel", from)
}

autostarr.vue.methods.roverInstall = function() {
  console.log("install rover", this.autostarr.player.address, this.autostarr.player.ship)
  if(!this.autostarr.player.ship){
    this.autostarr.player.inventory.rover.amount--
    this.autostarr.player.storage.amount--
    let rover = new Rover(this.autostarr.starsystem.id, this.autostarr.planet.id, this.autostarr.area.id)
    this.autostarr.area.rovers.push(rover)
//     this.autostarr.rover = rover
  }
}

autostarr.vue.methods.roverExplore = function(direction) {
  let rover = this.autostarr.rover
  let explore = this.autostarr.explore
  let starsystem = this.autostarr.starsystem
  let player = this.autostarr.player
  let spaceship = this.autostarr.spaceship
  let progress = this.progress
  let self = this
  //calculate trip duration and check rover for fuel
  if(rover.fuel.amount) {
    var duration = 5000/this.autostarr.rover.speed
    this.exploreSetAlert("alert-info", "Driving to another area...", "fa-rover")
    var planet = starsystem.planets[this.autostarr.planet.id]
    player.isMoving = true
    let targetArea = this.autostarr.area.id + direction
    if (targetArea < 0) {
      targetArea = planet.size - 1
    }
    if (targetArea >= planet.size) {
      targetArea = 0
    }
    let callback = function() {
      player.address[2] = targetArea
      rover.address[2] = targetArea
      if(planet.areas[targetArea]) {
          self.autostarr.area = planet.areas[targetArea]
          self.exploreSetAlert("alert-info", `You arrived at ${self.autostarr.area.title}`, "fa-truck-pickup")
         } else {
           planet.areas[targetArea] = new Area(self.autostarr.starsystem.id, planet.id, targetArea)
           self.autostarr.area = planet.areas[targetArea]
           self.exploreSetAlert("alert-info", `You arrived at an unknown area`, "fa-truck-pickup")
         }
      if (targetArea === spaceship.address[2]) {
        explore.jumbotron.image = "img/spaceship-landed.jpg"
      } else {
        explore.jumbotron.image = self.autostarr.area.image
      }
      explore.jumbotron.title = self.autostarr.area.title
      explore.jumbotron.description = self.autostarr.area.description
      if (!self.autostarr.area.discovered) {
        self.exploreSetAlert("alert-success", `You entered an undiscovered area.`)
        self.autostarr.area.discovered = true
      }
      player.isMoving = false
    }
    let update = function() {
      rover.fuel.amount -= 1/60
      if (rover.fuel.amount <= 0) {
        rover.fuel.amount = 0
      }    
    }
    this.progressAnimation(Date.now(), duration, callback, update)
   } else {
    this.exploreSetAlert("alert-warning", `Not enough fuel. Refuel your rover by crafting rover fuel cells.`, "fa-gas-pump")
   }
  
}