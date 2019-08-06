autostarr.vue.data.explore = {
  jumbotron: {
    image: "img/loading.gif",
    title: null,
    description: null
  },
  alert: {
    show: false,
    icon: null,
    type: "alert-info",
    message: null
  }
}

autostarr.vue.methods.exploreSetAlert = function(type, message, icon = null) {
  this.explore.alert.type = `${type} show` 
  this.explore.alert.icon = icon
  this.explore.alert.message = message
}

