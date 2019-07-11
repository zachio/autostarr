class Planet {
	constructor(address) {
	  let starId = address[0]
	  let planetId = address[1]
		this.id = planetId
		this.address=[starId, planetId]
		this.seed=starId*10+planetId
		this.color = this.pickColor()
		this.name = this.namePlanet()
		this.moons = Math.between(0,10,this.seed++)
		this.size = Math.between(50,100,this.seed++)
    let gap = 10000
		this.starDistance = Math.between(planetId*gap,planetId*gap+gap,this.seed++)
		this.image = "img/planet.jpg"
		this.scanned = false
		this.alert = {
			type: "alert-info",
			message: null
		},
		this.title = `The Planet ${this.name}`
		this.description = `${this.name} is a ${this.color} planet and has ${this.size} areas to explore. It has ${this.moons} moons and is ${this.starDistance} distance units from it's host star.`
		this.areas = []
		for(var i = 0; i < this.size; i++){
		  let areaId = i
		  this.areas.push(new Area([starId, planetId, areaId]))
		}
    this.icon = "fa-globe"
		return this
	}
	
	pickColor(){
		let colors=["white","orange","blue","red","green"]
		return colors[Math.between(0,colors.length,this.seed++)]
	}
	
	namePlanet(){
    let name=""
		let syllabols=Math.between(2 ,5, this.seed++)
		let sounds = ["kep","ler","an","dra","ma","ta","un","do","co","apt","ch"]
		for(let i=0;i<syllabols;i++){
			name+=sounds[Math.between(0,sounds.length,this.seed++)]
		}
			return name.charAt(0).toUpperCase()+name.slice(1) 
			}
	}