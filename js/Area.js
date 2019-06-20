class Area{
	constructor(starid, planetid, id){

		let planet = new Planet(starid,planetid)
		if(planet == null || id < 0 || id > planet.size){
			console.log(null)
			return null
		}
		this.id = id
		this.starid = starid
		this.planetid = planetid
		this.address = [starid,planetid,id]
		this.resources = []
		this.seed = starid * 10 + planetid * 100 + id
		return this
	}
	removeResource(id){
	 this.resources.splice(id,1)
	}
}