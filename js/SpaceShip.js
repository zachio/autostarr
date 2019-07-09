class SpaceShip{
	constructor(id,address){
	  this.id=id
	  this.address=address
	  this.pilot=null
	  this.fuel = 0
 	  this.fuelMax = 100
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
	  if(typeof address[2] != 'undefined') {
	    this.area = address[2]
	  }
    this.active = null
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
