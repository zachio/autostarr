class Star {
    constructor(starid, name) {
      this.id = 0
          this.address=[starid, 0]
      this.seed = starid + this.id
      this.name = `The ${name} Star`
          this.color = this.pickColor()
      this.description = `${this.name} is ${this.color}.`
      this.image = "img/sun.jpg"
      this.starDistance = 0
      this.icon = "fa-sun"
      this.size = null
      this.scanned = false
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
      
      pickColor(){
          let colors=["white","orange","blue","red","magenta", "yellow", "green", "purple"]
          return colors[Math.between(0,colors.length,this.seed++)]
      }
  }