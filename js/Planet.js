class Planet{
	constructor(starid, id){
		this.id = id
		let star=new StarSystem(starid)
		if(id <0 || id >star.planetTotal){
			console.log(null)
			return null
		}
		this.starid=starid
		this.address=[starid,id]
		this.seed=starid*10+id
		this.color = this.pickColor()
		this.name = this.namePlanet()
		this.moons = Math.between(0,10,this.seed++)
		this.size = Math.between(50,100,this.seed++)
		this.starDistance = Math.between(id*200,id*200+200,this.seed++)
		this.image = "img/planet.jpg"
		this.scanned = false
		
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