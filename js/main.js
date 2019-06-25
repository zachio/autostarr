Math.seed = 1

Math.seedRandom=function(offset=0){
	let seed = this.seed+offset
		if(seed===0){
			seed = 10000
		}
		let x = Math.sin(seed) * 10000
 return x - Math.floor(x)
}

Math.between = function(min,max,offset){
	return Math.floor(Math.seedRandom(offset) * (max - min) + min)
}
Math.chance=function (chance=0.5,offset=0){
	if(chance <= Math.seedRandom(offset)) {
		return true
	} else {
		return false
	}
}

class Location {
  constructor(address) {
    switch(address.length) {
      case 1:
        return new StarSystem(address[0])
      case 2:
        return new Planet(address[0], address[1])
      case 3:
        return new Area(address[0], address[1], address[2])
      default:
        return null
    }
  }
}

var json = []
var starsystem =      new StarSystem(0)
var player =          new Player(0, starsystem.address)
var spaceship =       new SpaceShip(0, starsystem.address)
var jumbotron =       new Vue({
  el: "#jumbotron",
  data: {
    image: "./img/loader.gif"
  }
})
var jumbotronTitle =  new Vue({
  el: "#jumbo-title",
  data: {
    message: starsystem.name 
  }
})
var jumboText =       new Vue({
  el: "#jumbo-text",
  data: {
    message: starsystem.jumbotext()
  }
})
var scanner =         new Vue({
  el: "#scanner",
  methods: {
    scan: function(event){
      console.log("Scanning...")
      if(starsystem.planetTotal && starsystem.scanned === false) {
        starsystem.scanned = true
        jumboText.innerHTML = starsystem.jumbotext() + " You discovered " + starsystem.planetTotal + " planets in this system."
        for(var i=0;i<starsystem.planetTotal;i++) {
          let planet = new Planet(starsystem.id, i)
          planets.push(planet)
          let col = document.createElement("div")
          col.className = "col-lg-3 col-md-6 mb-4"
          let card = document.createElement("div")
          card.className = "card h-100"
          let img = new Image()
          img.src = "img/planet.jpg"
          img.className = "card-img-top"
          let cardBody = document.createElement("div")
          cardBody.className = "card-body"
          let h4 = document.createElement("h4")
          h4.className = "card-title"
          h4.innerHTML = planet.name + " Planet"
          let p = document.createElement("p")
          p.className = "card-text"
          p.innerHTML = "The planet "+planet.name+" has "+planet.moons+" moons and has "+planet.size+" areas to explore and is "+Math.abs(planet.starDistance - player.starDistance)+" distance from you."
          let footer = document.createElement("div")
          footer.className = "card-footer"
          let orbitButton = document.createElement("button")
          orbitButton.className = "btn btn-primary"
          orbitButton.setAttribute("data-planet-id", i)
          orbitButton.innerHTML = "Orbit"
          orbitButton.addEventListener("click", function(event){
            let planetID = event.target.getAttribute("data-planet-id")
            let planet = planets[planetID]
            console.log("Beginning travel...", player, planet)
            let travelDistance = Math.abs(planet.starDistance - player.starDistance)
            if(spaceship.fuel >= travelDistance) {
              spaceship.fuel -= travelDistance
              let fuelPercent = Math.trunc((spaceship.fuel / spaceship.fuelMax) * 100)
              fuelLevel.percent = fuelPercent + "%"
              player.starDistance = planet.starDistance
              player.address = planet.address
              spaceship.address = planet.address
              jumbotron.image = "./img/planet.jpg"
              jumbotronTitle.message = planet.name
              jumboText.message = "You traveled "+travelDistance+" distance and are orbiting the planet " + planet.name + " with " + planet.moons + " moons. This planet orbits " + planet.starDistance + " distance from it's host star."
          } else {
            console.error("Not enough fuel")
          }})
          cardBody.appendChild(h4)
          cardBody.appendChild(p)
          footer.appendChild(orbitButton)
          card.appendChild(img)
          card.appendChild(cardBody)
          card.appendChild(footer)
          col.appendChild(card)
          cards.appendChild(col)
        }
        
        //Star Card
        let col = document.createElement("div")
        col.className = "col-lg-3 col-md-6 mb-4"
        let card = document.createElement("div")
        card.className = "card h-100"
        let image = new Image()
        image.src = "img/sun.jpg"
        image.className = "card-img-top"
        let cardBody = document.createElement("div")
        cardBody.className = "card-body"
        let h4 = document.createElement("h4")
        h4.innerHTML = starsystem.name + " Star"
        let p = document.createElement("p")
        p.className = "card-text"
        p.innerHTML = "The " + starsystem.name + " star system."
        let footer = document.createElement("div")
        footer.className = "card-footer"
        let orbitButton = document.createElement("button")
        orbitButton.innerHTML = "Orbit"
        orbitButton.className = "btn btn-primary"
        orbitButton.setAttribute("data-star-id", starsystem.id)
        orbitButton.id = "star" + starsystem.id
        orbitButton.addEventListener("click", function(){
        if(spaceship.fuel >= travelDistance) {
            starsystem.scanned = false
            let planetID = event.target.getAttribute("data-planet-id")
            let planet = planets[planetID]
            let travelDistance = Math.abs(planet.starDistance - player.starDistance)
            spaceship.fuel -= travelDistance
            let fuelPercent = Math.trunc((spaceship.fuel / spaceship.fuelMax) * 100)
            fuelLevel.percent = fuelPercent + "%"
            player.starDistance = planet.starDistance
            player.address = planet.address
            spaceship.address = planet.address
            let planetImg = new Image()
            planetImg.src = "img/planet.jpg"
            jumbotronTitle.message = planet.name
            jumboText.message = "You traveled "+travelDistance+" distance and are orbiting the planet " + planet.name + " with " + planet.moons + " moons. This planet orbits " + planet.starDistance + " distance from it's host star."
          } else {
            console.error("Not enough fuel")
          }
        })
        footer.appendChild(orbitButton)
        card.appendChild(image)
        cardBody.appendChild(h4)
        cardBody.appendChild(p)
        card.appendChild(cardBody)
        card.appendChild(footer)
        col.appendChild(card)
        cards.appendChild(col)
        
      }
    }
  }
})
var cards =           document.getElementById("cards")
var fuelLevel =       new Vue({
  el: "#fuel-level",
  data: {
    percent: "100%"
  }
})

var planets =         []

//Draw sun
jumbotron.image = "./img/sun.jpg"

//Update jumbotron title
jumboText.message = starsystem.jumbotext()

let starfield = new Image()
starfield.src = "img/starfield.jpg"
