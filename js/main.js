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
var app =             new Vue({
  el: "#app",
  data: {
    isLoading : false,
    fuelLevel : 100,    
    loadingImage   : "./img/loading.gif",
    structureImage : "./img/sun.jpg",
    structureDescription : null,
    currentOrbit : 0,
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
      /*if (this.fuelLevel < fuel_logic_goes_here){
        return;
      }*/
      this.fuelLevel -= 10; //do actual calc here
      this.currentOrbit = orbit_level;
    },
    scan: function(event){
      console.log("Scanning...")
      
    }
  }
})
var cards =           document.getElementById("cards")

var planets =         []