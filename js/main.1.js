Math.seed = 4

Math.seedRandom=function(){
	let seed = this.seed++
  if(seed===0){
    seed = 10000
  }
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

Math.seedRandomOffset = function(offset) {
  let seed = Math.seed + offset
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

Math.between = function(min,max,offset) {
	return Math.floor(Math.seedRandomOffset(offset) * (max - min) + min)
}

Math.chance = function (chance, seed){
	if(chance <= Math.seedRandomOffset(seed)) {
		return true
	} else {
		return false
	}
}

class Event {
  constructor(title, description, revealed, img, action) {
    this.title = title ? title : null
    this.description = description ? description : null
    this.revealed = revealed ? revealed : false
    this.img = img ? img : null
    this.action = action ? action : "Investigate"
  }
}

class Town {
  
}

class Cave {
  
}

class CrashedShip {
  
}

class Ruin {
  
}

class Planet {
	constructor(star, id) {
		this.star = new StarSystem(star)
    this.id = id
    this.seed = this.star.id * this.star.maxPlanetCount + id
		this.color = this.pickColor()
		this.name = this.namePlanet()
		this.moons = Math.between(0,2,this.seed++)
    this.maxAreaCount = 100
		this.size = Math.between(50,this.maxAreaCount, this.seed++)
    if(id > this.size) {
      console.log("This planet does not exist in this solar system.")
      this.id = 1
    } else if(id < 0) {
      console.log("This planet does not exist in this solar system.")
      this.id = this.size
    }
	}
	
	pickColor(){
		let colors=["white","orange","blue","red","green"]
		return colors[Math.between(0,colors.length,this.seed++)]
	}
	
	namePlanet() {
    let name=""
    let syllabols=Math.between(2 ,5, this.seed++)
    let sounds = ["fo","la","ma","bo","pa", "ka", "lo", "ou", "a", "ap","fu","ck","pe","nis"]
    for(let i=0;i<syllabols;i++){
      name+=sounds[Math.between(0,sounds.length,this.seed++)]
    }
    return name.charAt(0).toUpperCase()+name.slice(1) 
  }
}

class Area {
  //should the area be determined by the Star, Planet, and area added together to equal the seed.
  constructor(star, planet, id) {
    this.star = new StarSystem(star)
    this.planet = new Planet(star, planet)
    if(id > this.planet.size) {
      this.id = 1
    } 
    this.id = id
    this.seed = this.planet.seed + this.id
    this.interestPoints = Math.between(0,5, this.seed++)
    this.place=false
		this.places=[Town, Cave, CrashedShip, Ruin]
		
		// check if place 10
		let chance = Math.seedRandomOffset(this.seed++)
    if(chance <= 0.10){
			this.place = new this.places[Math.between(0,this.places.length, this.seed++)]();
		}
  }
}

// to simplify the location I could pass the location object in
class Player {
  constructor(location) {
    this.orbiting = false
    this.location = location
    if(this.location instanceof Planet || this.location instanceof StarSystem) {
      this.orbiting = true
    }
  }
}

class SpaceShip {
  constructor(location) {
    this.location = location
    this.player = false
    this.orbiting = false
  }
  enter(player) {
    this.player = player  
  }
  exit() {
    this.player = false
  }
  launch() {
    if(this.player) {
      this.location = this.location.planet
      this.player.location = this.location
      this.player.orbiting = true
      this.orbiting = true
      return this
    } else {
      console.error("Player is required to pilot the ship")
      return false
    }
  }
  land() {
    let area = new Area(this.location.star.id, this.location.id, 1)
    this.location = area
    this.player.location = area
    this.player.orbiting = false
    this.orbiting = false
    return this
  }
}

console.log(new StarSystem(1))
console.log(new Planet(1,1))
console.log(new Area(1,1,4))
console.log(new Player(new Area(1,1,1)))
console.log(new SpaceShip(new Planet(1,1,1)))

var player = new Player(new Area(1,1,4))
var spaceship = new SpaceShip(player.location)
spaceship.player = player
console.log(spaceship)


