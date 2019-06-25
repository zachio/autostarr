Math.seed = 1

Math.seedRandom=function(offset=0){
	let seed = this.seed+offset
		if(seed===0){
			seed = 10000
		}
		let x = Math.sin(seed) * 10000
 return x - Math.floor(x)
}

Math.between = function(min,max,offset){
	return Math.floor(Math.seedRandom(offset) * (max - min) + min)
}
Math.chance=function (chance=0.5,offset=0){
	if(chance <= Math.seedRandom(offset)) {
		return true
	} else {
		return false
	}
}

class Location {
  constructor(address) {
    switch(address.length) {
      case 1:
        return new StarSystem(address[0])
      case 2:
        return new Planet(address[0], address[1])
      case 3:
        return new Area(address[0], address[1], address[2])
      default:
        return null
    }
  }
}

var json = []
var app = new Vue({
  el: "#app",
  data: {
    isLoading : false,  
    loadingImage   : "./img/loading.gif",
    structureImage : "./img/sun.jpg",
    structureDescription : null,
    currentOrbit : -1, // -1 is the star
    starsystem   : null,
    player       : null,
    spaceship    : null,
  },
  created: function(){
    this.starsystem = new StarSystem(0)
    this.player     = new Player(0, this.starsystem.address)
    this.spaceship  = new SpaceShip(0, this.starsystem.address)
  },
  methods: {
    setOrbit: function(orbit_level){
      let tmpDistance = 0;
      if (orbit_level >= 0){
        tmpDistance = this.starsystem.planets[orbit_level].starDistance
      }
      let travelDistance = Math.abs(this.player.starDistance - tmpDistance)
      if (this.consumeFuel(travelDistance)){
        this.currentOrbit = orbit_level;
        this.player.starDistance = tmpDistance;
      }
    },
    consumeFuel: function(fuel_val){
      let tmpFuel = this.spaceship.fuel - fuel_val
      if (tmpFuel < 0) return false;
      this.spaceship.fuel = Math.max(0, tmpFuel); //do actual calc here
      return true;
    },
    scan: function(event){
      console.log("Scanning...")
      this.starsystem.planets = [];
      for(var i=0; i < this.starsystem.planetTotal; i++) {
        let planet = new Planet(this.starsystem.id, i)
        planet.scanned = true
        this.starsystem.planets.push(planet)
      }
    }
  }
})