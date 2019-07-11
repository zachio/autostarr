class Star {
    constructor(address) {
        this.id = address[1]
        this.address=address
        this.seed = this.id
        this.name = `The ${this.nameStar()} Star`
        this.color = this.pickColor()
        this.description = `${this.name} is a ${this.color} star.`
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