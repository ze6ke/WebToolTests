import 'babel-polyfill'

let i = 0
let maxFiles = 100000
let size = 5*1024*1024

const setSize = () => {
  let newVal = document.getElementById('fileSize').value
  newVal = parseInt(newVal)
  if(newVal) {
    size = newVal * 1024 * 1024
  }
}

const getDataURL = () => {
  return `/data?size=${size}`
}

const logSong = () => {
  console.log(`song ${i}: ${getDataURL()}`)
}

const fetchSongs = (_method) => {
  method = _method?_method:method
  
  switch(method) {
    case 'recursive': return fetchSongsRecursion()
    case 'timer': return fetchSongsTimer()
    default: console.alert('method not set in fetchSongs')
  }
}

const fetchSongsRecursion = () => {
  document.getElementById('app').innerHTML = `${i} songs retrieved`
  if(i >= maxFiles) {
    return
  }
  logSong()
  return fetch(getDataURL())
    .then(() => {
      i++
      !abort && fetchSongsRecursion ()
    })
}

const fetchSongsTimer = () => {
  document.getElementById('app').innerHTML = `${i} songs retrieved`
  if(i >= maxFiles) {
    return
  }
  logSong()
  fetch(getDataURL())

  i++
  !abort && setTimeout(fetchSongsTimer, 1000)
  
}

let abort = false
let method = ''

let pause = () => {
  abort = !abort
  document.getElementById('pause').innerHTML = abort?'Resume':'Pause'
  if(!abort) {
    fetchSongs()
  }
}

document.getElementById('startRecursion').onclick = () => fetchSongs('recursive')
document.getElementById('startTimer').onclick = () => fetchSongs('timer')
document.getElementById('pause').onclick = pause
document.getElementById('fileSize').onchange = setSize

/*let library = []

const getData = () => {
  return fetch('library.json')
  .then((response) => {
    if(response.ok) {
      return response.json()
    } else {
      throw {name:response.statusText, message: 'none'}
    }
  })
}

getData()
.then((_library) => {
  library = _library
})
*/

