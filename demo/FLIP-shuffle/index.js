const data = function createData (){
  return {
    renderList: [],
    prevRenderList: [],
    dimension: 10,
    $boundEl: null
  }
}

const created = function createdHook() {
  this.renderList = Array.from({length: this.dimension * this.dimension}).map((v, i) => { 
    return {
      number: (i % 9) + 1, 
      $el: null,
      id: i,
      data: {}
    } 
  })
}

const mounted = function mountedHook() {
  render(this)
}
const beforeUpdate = function beforeUpdateHook () {
  render(this)
}
const updated = function updatedHook () {
  this.renderList.forEach(callPendingCbs)
  this.renderList.forEach(recordPositions)
  this.renderList.forEach(applyTransition)

  // force renderer do reflow
  this._reflow = document.body.offsetHeight
 

  this.renderList.forEach(item => {
    if (item.data.inverted) {
      const el = item.$el
      el.classList.add('move')
      el.style.transform = el.style.transitionDuration = ''
      item.data.inverted = false
      el.addEventListener('transitionend', el._moveCb = function cb (e){
        if (e && e.target !== el) {
          return
        }
        el.removeEventListener('transitionend', cb)
        el._moveCb = null
        el.classList.remove('move')
      })
    }

    
  })          
  
}
const vm = new Vue({
  el: '#app',
  data,
  created,
  mounted,
  updated,
  beforeUpdate,
  methods: {
    shuffleEls() {
      this.prevRenderList = this.renderList
      this.renderList = shuffle(this.renderList)
    }
  }
})

function recordPositions (item) {
  item.data.newPos = item.$el.getBoundingClientRect()
}
function callPendingCbs (item) {
  const el = item.$el
  if (el._moveCb) {
    el._moveCb()
  }
}
function render (vm) {
  vm.$boundEl = vm.$refs.bound
  vm.$boundEl.style.width = 25 * vm.dimension + 'px'
  const cells = vm.$boundEl.querySelectorAll('.cell')
  for (let i = 0; i < cells.length; i++) {
    const item = vm.renderList[i]

    item.$el = cells[i]
    item.data.pos = cells[i].getBoundingClientRect()
    

  }
}
function applyTransition (item) {

  const oldPos = item.data.pos
  const newPos = item.data.newPos
  const dx = oldPos.left - newPos.left
  const dy = oldPos.top - newPos.top

  if (dx || dy) {
    const sty = item.$el.style
    item.data.inverted = true

    sty.transform = `translate(${dx}px,${dy}px)`
    sty.transitionDuration = '0s'
  }
}
