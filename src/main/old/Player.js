export default class Player {
	constructor(id,address){
		this.id=id
		this.address=[...address]
		this.vehicle = null
		this.starDistance = 0
		this.isMoving = false
		this.isOrbiting = false
		this.isLanded = true
		this.ship = null
		this.isScanning = false
    this.isMining = false
		this.energy = {
		  amount: 1,
		  max: 100
		}
		this.inventory = {
			max: 100,
			amount: 0,
			carbon: 0,
      minerals: 0
		}
	}
}
