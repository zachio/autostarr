class Rover {
    constructor(address) {
      this.address = address
      this.fuel = {
        amount: 0,
        max: 10
      }
      this.speed = 2
      this.player = null
    }
  }