class SpaceShip{
	constructor(id,address){
		this.id=id
		this.address=[...address]
		this.pilot=null
		this.fuel = 1000
		this.fuelMax = 1000
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
