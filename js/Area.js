class Area {
	constructor(starid, planetid, areaid){
		let planet = new Planet(starid,planetid)
		if(planet == null || areaid < 0 || areaid > planet.size){
			console.error("Area does not exit!")
			return null
		}
		this.id = areaid
		this.address = [starid, planetid, areaid]
		this.anomolies = []
		this.seed = starid * 10 + planetid * 100 + areaid
		let images = ["img/planet.1.groundlevel.png", "img/380_max.jpg"]
		this.image = images[Math.between(0, images.length, this.seed++)]
		this.scanned = false
		this.scannedPercent = 0
		this.title = `Unknown Area`
		this.description = `You entered an unknown area`
    let carbon = Math.between(0,100, this.seed++)
    let minerals = Math.between(0,100, this.seed++)
    this.resources = {
      carbon: {
        item: "carbon",
        alias: "Carbon",
        icon: "fa-tree",
		    max: carbon,
		    amount: carbon
		  },
      minerals: {
        item: "minerals",
        alias: "Minerals",
        icon: "fa-mountain",
        max: minerals,
        amount: minerals
      }
    }

    
    this.rovers = []
		return this
	}
	removeResource(id){
	 this.resources.splice(id,1)
	}
}