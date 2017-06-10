let isString = function(v) {
  return typeof v === 'string' || v instanceof String
}

let getAllKeys = function (o) {
  let a = []
  for(let e in o) {
    a.push(e)
  }
  return a
}

let formatError = function (e, source) {
  let message = source?'source: ' + source : ''
  let lineFeed = '\n'

  if(e.target){
    if(e.target.error) {
      message += lineFeed + 'target.error: ' + formatError(e.target.error, '', lineFeed)
    } else {
      message += 'target: ' + getAllKeys(e.target)
    }
  } else if(e.name) {
    message += 'name: ' + e.name
  }
  else if(isString(e)){
    message += e
  }
  else {
    message += getAllKeys(e)//Object.keys(e)//JSON.stringify(e) 
  }
  if(e.message) {
    message += lineFeed + 'message: ' + e.message
  }
  if(message.length === 0) {
    message = 'no info could be determined'
  }
  return message
}

function getItemSize(item, depth=1) {
  if(item.byteLength !== undefined) {
    return item.byteLength
  } else if(item.size !== undefined) {
    return item.size
  } else if(item.length !== undefined) {
    return item.length
  } else if (depth >= 5) {
    return 0
  } else if (typeof(item) == 'object') {
    return Object.keys(item).reduce((acc, v) => acc += getItemSize(v, depth+1), 0)
  } else {
    return 0
  }
}


let clearErrors = function () {
  let el = document.getElementById('errors')
  el.innerHTML = ''
}

let displayError = function (e, source) {
  let el = document.getElementById('errors')
  const lineFeed = el?'<br>':lineFeed 
  const message = formatError(e, source, lineFeed).replace(/\n/g, lineFeed)

  if(el) {
    el.innerHTML += '<p>' + message
  }
  else {
    alert (message)
  }
}

window.onerror = function(e) {
  displayError(e)
}

let showIndexedDBVariables = function() {
  let retval = ''
  retval += 'indexedDB: ' + window.indexedDB
  retval += '\nwebkitIndexedDB: ' + window.webkitIndexedDB
  retval += '\nAre they equal: ' + (window.indexedDB === window.webkitIndexedDB)
  return retval
}

let db = undefined

let openDB = function() {
  return new Promise(function (resolve, reject) {
    let request = indexedDB.open('store', 1)

    request.onsuccess = function(e) {
      displayError('DB opened')
      db = e.target.result
      resolve(db)
    }

    request.onerror = function(e) {
      displayError(e)
      reject(e)
    }

    request.onupgradeneeded = function(e) {
      displayError('upgrade needed called')
      let db = request.result
      db.createObjectStore('store');
    }
  })
}

let resetDB = function() {
  return new Promise(function (resolve, reject) {
    db.close()
    let deleteRequest
    deleteRequest = indexedDB.deleteDatabase('store')
    deleteRequest.onsuccess = function(e) {
      resolve()
    }
    deleteRequest.onerror = function(e) {
      reject(e)
    }
  })
}

let putData = function(data, key, report=true) {
  return new Promise(function(resolve, reject) {
    report && displayError('putting ' + key)
    let tran = db.transaction('store', 'readwrite')
    let st = tran.objectStore('store')
    let put = st.put(data, key)

    put.onsuccess = function(e) {
      report && displayError(key + ' put succeeded')
      resolve()
    }
    put.onerror = function(e) {
      displayError(e)
      reject()
    }
  })
}

let nextTickPromise = function() {
  return new Promise(function(resolve) {
    setTimeout(resolve, 0)
  })
}


let testDBFunctionality = function() {
  let thePromise = openDB()
    .then(function() {
      return putData('string', 'string')
    })
    .then(function() {
      return putData([1,2,3], 'array')
    })
    .then(function() {
      return putData({hi:5, bye:5}, 'simple object')
    })
    .then(function() {
      return putData(new Blob([1,2,3,4]), 'blob')
    })
}

let generateRandomData = function(bytes) {
  let retval = new Uint8Array(bytes)
  for(let i = 0;i<bytes;i++)
  {
    retval[i] = Math.floor(Math.random() * 256)
  }
  return retval
}

let testSizeLimits = function() {
  const oneMB = Array(1024*1024).join('x')
  const fiveMB = Array(5*1024*1024).join('x')
  thePromise = openDB()

  function moreData() {
    if(i > max) {
      throw {name: 'limit reached', message: 'it can store lots of data'}
    }

    return putData(generateRandomData(s), '' + i, false)
      .then(function() {
        console.log((i * s /1024/1024).toFixed(2) + ' total MB saved')
        i++
        if(!abort) {
          return moreData()
        }
      })
      .catch(function(e) {
        if(e.name === 'limit reached'){
          displayError('testing limit reached')
        } 
        displayError(i + ' MB saved')
      })
  }
  thePromise.then(function() {
    return moreData()
  })
}

let abort = false
let i = 0
let max = 1000
let s = 5*1024*1024

let getDataUsage =  function() {
  return openDB()
    .then(() => (
      new Promise((resolve, reject) => {
        let size = 0
        let objectStore = db.transaction(['store'], 'readonly')
          .objectStore('store')
        let cursorRequest = objectStore.openCursor()
        cursorRequest.onerror = (e) => {
          reject(e)
        }
        cursorRequest.onsuccess = (e) => {
          let cursor = e.target.result
          if(cursor) {
            size += getItemSize(cursor.value)
            cursor.continue() //on success will be called again on the next item (or with a falsey e.target.result)
          } else {
            displayError((size/1024/1024).toFixed(2) + ' total MB stored')
          }
        }
        console.log('cursor request made')
      })
    ))
}

let setupButton = function() {
  document.getElementById('showSize').onclick = function()
  {
    getDataUsage()
  }
  document.getElementById('sizeTest').onclick = function()
  {
    testSizeLimits()
  }
  document.getElementById('clear').onclick = function()
  {
    clearErrors()
  }
  document.getElementById('functionalityTest').onclick = function()
  {
    displayError(showIndexedDBVariables())
    testDBFunctionality()
  }
  document.getElementById('resetDB').onclick = function()
  {
    openDB().then(resetDB)
      .then(function() {
        displayError('DB reset')
      })
  }
  document.getElementById('stop').onclick = function()
  {
    abort = !abort
    document.getElementById('stop').innerHTML = abort?'Resume':'Stop'
    testSizeLimits()
  }
}

window.onload = setupButton

