export default class SpaceShip{
	constructor(id,starId=null,planetId=null,areaId=null){
	  this.id=id
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
    this.inventory = {
      max: 1000,
      amount: 0,
      carbon: 0,
      minerals: 0
    }
	  this.speed = 1
	  this.area = null
    this.progress = {
      enter: 0,
      exit: 0,
      travel: 0
    }
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
    
	}
	enter(player){
	  this.pilot=player.id
      player.vehicle = this.id
      console.log("Player", player.id,"entered the Space Ship.")
	}
	eject(player){
	  this.pilot=null
      player.vehicle = null
      console.log("Player", player.id,"left the ship.")
	}
	launch(player, area){
		if(this.pilot){
      this.address.length--
      player.address.length--
      console.log("Player", player.id,"launched!")
      for(let i=0;i<area.resources.length;i++) {
        if(this == area.resources[i]) {
           area.removeResource(i)
        }
      }
		}
	}
	land(player){
		this.address.push(0)
    player.address = this.address
    console.log("Player",player.id,"landed.")
	}
}
