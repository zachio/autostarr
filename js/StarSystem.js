class StarSystem{
	constructor (id){
		this.id = id
		this.address=[id]
    this.seed = id
		this.name = this.nameStar()
		this.color = this.pickColor()
    this.planetTotal = Math.between(3,10,this.seed++)
    this.planets = []
    this.scanned = false
    this.description = this.jumbotext()
    this.image = "img/sun.jpg"
	}
	
	nameStar(){
		let name=""
		let syllabols=Math.between(2 ,5, this.seed++)
		let sounds = ["fo","ler","kep","bo","pi","th",]
		for(let i=0;i<syllabols;i++){
			name+=sounds[Math.between(0,sounds.length,this.seed++)]
		}
			return name.charAt(0).toUpperCase()+name.slice(1)
	}
	
	pickColor(){
		let colors=["white","orange","blue","red"]
		return colors[Math.between(0,colors.length,this.seed++)]
	}
  
  jumbotext() {
    return "You are orbiting the " + this.name + " " + this.color + " star."
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
