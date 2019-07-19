class Rover {
  constructor(starid, planetid, areaid) {
    this.address = [starid, planetid, areaid]
    this.fuel = {
      amount: 0,
      max: 100
    }
    this.speed = 3
    this.player = null
    this.inventory = {
      max: 500,
      amount: 0,
      carbon: 0,
      minerals: 0
    },
    this.isCrafted = false
  }
}