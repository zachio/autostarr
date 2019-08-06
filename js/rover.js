'use strict'

 class Rover { 
   constructor(starid, planetid, areaid) {
    this.address = [starid, planetid, areaid]
    let planet = new Planet(starid, planetid)
    let area = new Area(starid, planetid, areaid)
    this.alias = `The ${planet.name} ${area.id} Rover`
    console.log(this.alias)
    this.storage = {
      amount: 0,
      max: 500
    }
    this.inventory= {},
    this.player = null
    this.name = null
    this.speed = 5
    this.fuel = {
      amount: 0,
      max: 100
    }
  }
}

autostarr.vue.methods.roverEnter = function(index) {
  this.rover = this.area.rovers[index]
  this.area.rovers.splice(index, 1)
  this.player.rover = true
}

autostarr.vue.methods.roverExit = function() {
  this.area.rovers.push(this.rover)
  this.rover = null
  this.player.rover = false
}

autostarr.vue.methods.roverRefuel = function(from) {
  if(this.player.rover && this[from].inventory.roverFuelCells.amount > 0 && this.rover.fuel.amount < this.rover.fuel.max){
    this[from].inventory.roverFuelCells.amount--
    this[from].storage.amount--
    this.rover.fuel.amount++
  }
  console.log("refuel", from)
}

autostarr.vue.methods.roverInstall = function() {
  console.log("install rover", this.player.address, this.player.ship)
  if(!this.player.ship){
    this.player.inventory.rover.amount--
    this.player.storage.amount--
    this.area.rovers.push(new Rover(this.starsystem.id, this.planet.id, this.area.id))   
  }
}

autostarr.vue.methods.roverExplore = function(direction) {
  let rover = this.rover
  let explore = this.explore
  let starsystem = this.starsystem
  let player = this.player
  let spaceship = this.spaceship
  let progress = this.progress
  //calculate trip duration and check rover for fuel
  var duration = 5000/this.rover.speed
  this.exploreSetAlert("alert-info", "Driving to another area...", "fa-rover")
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
    rover.fuel.amount -= 1/60
    if (rover.fuel.amount <= 0) {
      rover.fuel.amount = 0
    }    
  }
  this.progressAnimation(Date.now(), duration, callback, update)
}