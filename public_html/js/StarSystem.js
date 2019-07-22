class StarSystem {
	constructor (id){
		this.id = id
		this.address=[id]
    this.seed = id
		this.name = this.nameStar()
    this.planetTotal = Math.between(2,6,this.seed++)
    this.planets = []
    this.astronomicalObjects = []
    this.astronomicalObjects.push(new Star(id, this.name))
    for(var i=0; i < this.planetTotal; i++) {
      let planet = new Planet(id, i+1)
      this.planets.push(planet)
      this.astronomicalObjects.push(planet)
    }
	}
  
  nameStar(){
		let name=""
		let syllabolCount=Math.between(2 ,5, this.seed++)
		let syllabols = ["fo","ler","kep","bo","pi","the","thi","ph","ad"]
		for(let i=0;i<syllabolCount;i++){
			name+=syllabols[Math.between(0,syllabols.length,this.seed++)]
		}
			return name.charAt(0).toUpperCase()+name.slice(1)
	}
  
  draw(canvas) {
    //draw starfield
    let starfield = new Image()
    starfield.src = "../img/starfield.jpg"
    let self = this
    let loader = document.getElementById("loader")
    starfield.addEventListener("load",function(){
      canvas.drawImage(starfield,0,0, starfield.width/2,starfield.height/2)
      //draw star
      canvas.fillStyle = "white"
      canvas.strokeStyle = self.color
      canvas.lineWidth = 10
      canvas.beginPath()
      canvas.arc(canvas.canvas.width / 4, canvas.canvas.height * 1.25, canvas.canvas.width / 2, 0, 2 * Math.PI)
      canvas.fill()
      canvas.stroke()
    })
    
  }
}
