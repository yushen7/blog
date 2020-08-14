/**
 * 
 * @param {Array} arr 
 */

function shuffle (arr) {
  if (!Array.isArray(arr)) {
    throw new TypeError(`${typeof arr} must be an Array!`)
  }
  const copyed = arr.slice()
  const last = copyed.length - 1
  for (let i = 0; i <= last; i++) {
    const rand = random(i, last)
    const tmp = copyed[i]
    copyed[i] = copyed[rand]
    copyed[rand] = tmp
  }
  return copyed
}
/**
 * 
 * @param {Number} min 
 * @param {Number} max 
 */
function random (min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}