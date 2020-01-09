class Explore {
  constructor() {
    this.jumbotron = {
    image: "img/loading.gif",
    title: null,
    description: null
    },
    this.alert = {
      show: false,
      icon: null,
      type: "alert-info",
      message: null
    }
  }
  
}

autostarr.vue.methods.exploreSetAlert = function(type, message, icon = null) {
  this.autostarr.explore.alert.type = `${type} show` 
  this.autostarr.explore.alert.icon = icon
  this.autostarr.explore.alert.message = message
}

