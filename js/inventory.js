'use strict'
class Item {
  constructor(name, desc = null, image = null, icon = null, recipe = null, cost = 0){
    this.name = name
    this.desc = desc
    this.image = image
    this.amount = 0,
    this.icon = icon,
    this.recipe = recipe 
  }
}

class Inventory {
  constructor() {
    this.carbon = new Item("Carbon", "Use carbon to craft fuels for Rovers and Spaceships.", "img/carbon.gif", "fa-tree")
    this.minerals = new Item("Minerals", null, null, "fa-mountain")
    this.roverFuelCells = new Item("Rover Fuel Cells", 
      `Craft rover fuel cells to fuel your rover.`, 
      "img/fuel-cell.4.jpg", "fa-gas-tank", {
      carbon: {
        name: "Carbon",
        icon: "fa-tree",
        amount: 0,
        cost: 5
      }
    })
  }
}

autostarr.vue.methods.inventoryMove = function(item, from, to) {
  if(this.autostarr[from].inventory[item].amount >= 1 && this.autostarr[to].storage.amount < this.autostarr[to].storage.max) {
    this.autostarr[from].inventory[item].amount--
    this.autostarr[from].storage.amount--
    if(typeof this.autostarr[to].inventory[item] === "undefined") {
       this.autostarr[to].inventory[item] = {
         name: this.autostarr[from].inventory[item].name,
         item: item,
         amount: 0,
         icon: this.autostarr[from].inventory[item].icon,
         install: (this.autostarr[from].inventory[item].install) ? this.autostarr[from].inventory[item].install : false,
         storage: to
       }
    }
    this.autostarr[to].inventory[item].amount++
    this.autostarr[to].inventory[item].storage = to
    this.autostarr[to].storage.amount++
  }
}

autostarr.vue.methods.inventoryTrash = function(item, from) {
  this.autostarr[from].inventory[item].amount--
  this.autostarr[from].storage.amount--
}

