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


function setupCanvas(canvas) {
  // Get the device pixel ratio, falling back to 1.
  var dpr = window.devicePixelRatio || 1;
  // Get the size of the canvas in CSS pixels.
  var rect = canvas.getBoundingClientRect();
  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  var ctx = canvas.getContext('2d');
  // Scale all drawing operations by the dpr, so you
  // don't have to worry about the difference.
  ctx.scale(dpr, dpr);
  return ctx;
}

var json = []

var starsystem = new StarSystem(0)
var player = new Player(0, starsystem.address)
var spaceship = new SpaceShip(0, starsystem.address)
var loader = document.getElementById("loader")
var jumbotron = document.getElementById("jumbotron")
var canvas = setupCanvas(jumbotron)
var jumbotronTitle = document.getElementById("jumbo-title")
var jumboText = document.getElementById("jumbo-text")
var scanner = document.getElementById("scanner")
var cards = document.getElementById("cards")
var planets = []
var planetButtons = []
scanner.addEventListener("click", function(){
  console.log("Scanning...")
  if(starsystem.planetTotal && starsystem.scanned == false) {
    starsystem.scanned = true
    jumboText.innerHTML = "You discovered " + starsystem.planetTotal + " planets in this system."
    cards.innerHTML = ""
    for(var i=0;i<starsystem.planetTotal;i++) {
      let planet = new Planet(starsystem.id, i)
      planets.push(planet)
      let card = "<div class=\"col-lg-3 col-md-6 mb-4\"><div class=\"card h-100\"><img class=\"card-img-top\" src=\"img/planet.jpg\" alt=\"Card image cap\"><div class=\"card-body\"><h4 class=\"card-title\">Planet "+planet.name+"</h4><p class=\"card-text\">The planet "+planet.name+" has "+planet.moons+" moons and has "+planet.size+" areas to explore and is "+planet.starDistance+" distance from it's host star.</p></div><div class=\"card-footer\"><button class=\"btn btn-primary\" id=\"planet"+i+"\" data-planet-id=\""+planet.id+"\">Orbit</button></div></div></div>"
      cards.innerHTML += card
    }
    for(var i = 0; i < starsystem.planetTotal; i++) {
      planetButtons.push(document.getElementById("planet"+i))
      planetButtons[i].addEventListener("click", function(event){
        let planetID = event.target.getAttribute("data-planet-id")
        let planet = planets[planetID]
        let planetImg = new Image()
        planetImg.src = "img/planet.jpg"
        //clear canvas
        canvas.clearRect(0,0,jumbotron.width,jumbotron.height)
        //draw planet image on canvas
        canvas.drawImage(planetImg,0,0)
        jumbotronTitle.innerHTML = planet.name
        jumboText.innerHTML = "You are orbiting the planet " + planet.name + " with " + planet.moons + " moons. This planet orbits " + planet.starDistance + " distance from it's host star."
        console.log(planet)
        window.scrollTo(0,0)
      })
    }
  }
  
})

//style jumbotron
jumbotron.style.backgroundColor = "black"

//Draw stars
starsystem.draw(canvas)

//Update jumbotron title
jumbotronTitle.innerHTML = starsystem.name
jumboText.innerHTML = starsystem.jumbotext()

let starfield = new Image()
starfield.src = "img/starfield.jpg"