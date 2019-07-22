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