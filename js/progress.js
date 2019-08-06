class ProgressBar {
  constructor(min = 0, max = 100, value = 0){
    this.min = min
    this.max = max
    this.value = value
    this.percent = (this.value / this.max) * 100
  }
  updatePercent() {
    this.percent = (this.value / this.max) * 100
  }
  timer(duration){
    var start = Date.now()
    var self = this
    var progress = 0
    var loop = setInterval(function(){
      progress = Date.now() - start // (progress / duration) * 100
      self.percent = (progress / duration) / 100
      if(progress >= duration){
         clearInterval(loop)
      }
    },duration)
  }
}

autostarr.vue.data.progress = {
  show: true,
  percent: 0,
  type: "progress-bar-info"
}

autostarr.vue.methods.progressAnimation = function(start, duration, callback = null, update = null){
  let self = this
  this.progress.percent = 0
  let interval = function() {
    let progress = Date.now() - start
    if (progress < duration) {
      self.progress.percent = (progress / duration) * 100
      if (update) {
        if(update() == false) {
          return
        }
      }
      requestAnimationFrame(interval)
    } else {
      if (callback) {
        callback()
        self.progress.percent = 0
      }
    }
  }
  requestAnimationFrame(interval)
}
