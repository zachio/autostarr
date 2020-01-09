autostarr.vue.data.crafting = {
  alert: {
    type: null,
    icon: null,
    message: null
  },
  recipes: {
    rover: {
      item: "rover",
      image: "img/rover.png",
      name: `Rover`,
      desc: `A land vehicle that can get you around planets much quicker and can even charge you.`,
      fullCount: 0,
      icon: "fa-truck-pickup",
      install: 'roverInstall',
      ingredients: {
        minerals: {item: 'minerals', amount: 0, cost: 100, icon: "fa-mountain", full: false}
      }
    },
    roverFuelCells: {
      item: "roverFuelCells",
      image: "img/fuel-cell.4.jpg",
      name: `Rover Fuel Cell`,
      desc: `Craft rover fuel cells to fuel your rover.`,
      fullCount: 0,
      icon: "fa-gas-pump",
      install: 'roverRefuel',
      ingredients: {
        carbon: {item: 'carbon', amount: 0, cost: 5, icon: "fa-tree", full: false},
        minerals: {item: 'minerals', amount: 0, cost: 2, icon: "fa-mountain", full: false}
      }
    },
    shipFuelCells: {
      item: "shipFuelCells",
      image: "img/fuel-cell.5.jpg",
      name: `Ship Fuel Cell`,
      desc: `Craft ship fuel cells to fuel your spacecraft.`,
      fullCount: 0,
      icon: "fa-gas-pump",
      install: 'spaceshipRefuel',
      ingredients: {
        carbon: {item: 'carbon', amount: 0, cost: 10, icon: "fa-tree", full: false},
        minerals: {item: 'minerals', amount: 0, cost: 2, icon: "fa-mountain", full: false}
      }
    },
    batteries: {
      item: "batteries",
      image: "img/fuel-cell.2.jpg",
      name: `Batteries`,
      desc: `Use batteries to recharge your body.`,
      fullCount: 0,
      icon: "fa-battery-full",
      install: 'playerRecharge',
      ingredients: {
        minerals: {item: 'minerals', amount: 0, cost: 5, icon: "fa-mountain", full: false}
      }
    },
    antiMatterFuelCells: {
      item: "antiMatterFuelCells",
      image: "img/fuel-cell.6.jpg",
      name: `Anti Matter Fuel Cell`,
      desc: `Use Anti Matter Fuel Cells to fuel your ship to interstellar travel possible.`,
      fullCount: 0,
      icon: "fa-atom",
      install: 'spaceshipRefuelAntimatter',
      ingredients: {
        minerals: {item: 'minerals', amount: 0, cost: 50, icon: "fa-mountain", full: false}
      }
    }
  }
}

autostarr.vue.methods.craftingSetAlert = function(message, type = 'alert-primary', icon = null){
  if(type) 
    this.crafting.alert.type = type
  if(icon)
    this.crafting.alert.icon = icon
  this.crafting.alert.message = message
}

autostarr.vue.methods.craftingRoverFuelCell = function() {
  const player = this.player 
  const roverFuelCell = this.crafting.recipes.roverFuelCell
  if(roverFuelCell.carbon.amount < roverFuelCell.carbon.max && player.inventory.carbon){
    player.inventory.carbon--
    player.inventory.amount--
    roverFuelCell.carbon.amount++
  } else {
    this.craftingSetAlert(`Not enough carbon to craft a Rover Fuel Cell.`,'alert-danger','fa-tree')
  }
  if(roverFuelCell.carbon.amount === roverFuelCell.carbon.max && player.inventory.amount < player.inventory.max) {
    player.inventory.roverFuelCells++
    player.inventory.amount++
    roverFuelCell.carbon.amount = 0
  }
}

autostarr.vue.methods.craftingCraft = function(item, ingredient){
  let player = this.autostarr.player 
  let craft = this.crafting.recipes[item]
  if(craft.ingredients[ingredient.item].amount < craft.ingredients[ingredient.item].cost && player.inventory[ingredient.item].amount > 0){
    player.inventory[ingredient.item].amount--
    player.storage.amount--
    craft.ingredients[ingredient.item].amount++
  } 

  if(craft.ingredients[ingredient.item].amount === craft.ingredients[ingredient.item].cost && !craft.ingredients[ingredient.item].full) {
    craft.ingredients[ingredient.item].full = true
    craft.fullCount++
  }
  //TODO: handle rover crafting
  if(craft.fullCount === Object.keys(craft.ingredients).length && player.storage.amount < player.storage.max) {
    if(typeof player.inventory[item] === 'undefined') {
       player.inventory[item] = {
         name: craft.name,
         item: craft.item,
         amount: 0,
         icon: craft.icon,
         install: (craft.install) ? craft.install : false,
         storage: 'player'
       }
    }
    player.inventory[item].amount++
    player.storage.amount++
    for(let ingred in craft.ingredients){
      craft.ingredients[ingred].amount = 0
      craft.ingredients[ingred].full = false
    }
    craft.fullCount = 0
  }
  
}