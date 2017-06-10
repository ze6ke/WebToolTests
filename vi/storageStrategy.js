import util from './util.js'

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

const storageStrategy = {
  getStrategy: function(type) {
    switch (type) {
      case 'volatile': return Promise.resolve().then(() => storageStrategy.volatile)
      case 'sessionStorage': return Promise.resolve().then(() => storageStrategy.sessionStorage)
      case 'localStorage': return Promise.resolve().then(() => storageStrategy.localStorage)
      case 'indexedDB': return storageStrategy.indexedDB.initialize()
      default: throw {name: 'type undefined', message: 'The type passed in is not valid: ' + type}
    }
  },
  resetStrategy: function(type) {
    switch (type) {
      case 'indexedDB': return storageStrategy.indexedDB.reset()
      case 'volatile':
      case 'sessionStorage':
      case 'localStorage': return Promise.resolve()
      default: throw {name: 'type undefined', message: 'The type passed in is not valid: ' + type}
    }
  },
  volatile: {
    name: 'volatile',
    reset: function() {
      return Promise.resolve()
    },

    storeData: function(theSong, data) {
      theSong.data = data
      return Promise.resolve()
    },

    prepare: function(theSong) {
      return Promise.resolve()
      .then(() => {
        theSong.tempData = theSong.data
        theSong.URL = window.URL.createObjectURL(theSong.tempData)
        return theSong.URL
      })
    },

    hasData: function(theSong) {
      return Promise.resolve(!!theSong.data)
    },

    clearData: function() {
      return Promise.resolve()
    },

    getDataUsage: function() {
      return Promise.resolve(0)
    }
  },

  sessionAndLocalStorage: {
    storeData: function(storage, theSong, data) {
      return util.blobToBase64Strings(data, theSong.file)
      .then((strings) => {
        strings.map((o, i)=>{
          if(i===0){
            storage.setItem(o.key, JSON.stringify({length:o.length, type:o.type}))
          } else {
            storage.setItem(o.key, o.base64String)
          }
        })
      })
    },
    prepare: function(storage, theSong) {
      return new Promise((resolve, reject) => {
        const info = JSON.parse(storage.getItem(theSong.file))
        let stringArray = []
        for(let i = 1;i<=info.length;i++) {
          stringArray.push(storage.getItem(theSong.file + '-' + i))
        }
        theSong.tempData = util.base64StringsToBlob(stringArray, info.type)
        theSong.URL = window.URL.createObjectURL(theSong.tempData)
        resolve(theSong.URL)
      })
    },
    hasData: function(storage, theSong) {
      return Promise.resolve(storage.getItem(theSong.file))
    },

    clearData: function(storage) {
      return Promise.resolve(storage.clear())
    },

    getDataUsage: function(storage) {
      return Promise.resolve(Object.keys(storage).reduce((acc, val) => {
        return acc += storage.getItem(val).length * 2
      }, 0)/1024/1024)
    }
  },

  localStorage: {
    name: 'local storage',
    reset: function() {
      return Promise.resolve()
    },
    storeData: function(theSong, data) {
      return storageStrategy.sessionAndLocalStorage.storeData(localStorage, theSong, data)
    },
    prepare: function(theSong) {
      return storageStrategy.sessionAndLocalStorage.prepare(localStorage, theSong)
    },
    hasData: function(theSong) {
      return storageStrategy.sessionAndLocalStorage.hasData(localStorage, theSong)
    },
    clearData: function() {
      return storageStrategy.sessionAndLocalStorage.clearData(localStorage)
    },
    getDataUsage: function() {
      return storageStrategy.sessionAndLocalStorage.getDataUsage(localStorage)
    }
  },

  sessionStorage: {
    name: 'session storage',

    reset: function() {return Promise.resolve()},
    storeData: function(theSong, data) {
      return storageStrategy.sessionAndLocalStorage.storeData(sessionStorage, theSong, data)
    },
    prepare: function(theSong) {
      return storageStrategy.sessionAndLocalStorage.prepare(sessionStorage, theSong)
    },
    hasData: function(theSong) {
      return storageStrategy.sessionAndLocalStorage.hasData(sessionStorage, theSong)
    },
    clearData: function() {
      return storageStrategy.sessionAndLocalStorage.clearData(sessionStorage)
    },
    getDataUsage: function() {
      return storageStrategy.sessionAndLocalStorage.getDataUsage(sessionStorage)
    }
  },

  indexedDB: {
    name: 'indexedDB',
    indexedDB: window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB,
    IDBTransaction: window.IDBTransaction || window.webkitIDBTransaction || window.OIDBTransaction || window.msIDBTransaction,
    dbVersion: 5,
    dbName: 'songs',
    objectStoreName: 'songs',
    initialize: function()  {
      return new Promise((resolve, reject) => {
        this.request = this.indexedDB.open(this.dbName, this.dbVersion)

        this.request.onupgradeneeded = (e) => {
          let db = e.target.result
          let os = this.createObjectStore(db)
    
          os.transaction.oncomplete = () => {
            let tran = db.transaction(['songs'], 'readwrite')
            let os = tran.objectStore('songs')
            let p = os.put(new Map(), 'config')
          }
        }
        this.request.onerror = (e) => {
          reject(e)
        }

        this.request.onsuccess = (e) => {
          this.db = this.request.result
          resolve(storageStrategy.indexedDB)
        }
      })
    },
    createObjectStore: function(db) {
      if(db.objectStoreNames.contains(this.objectStoreName)) {
        db.deleteObjectStore(this.objectStoreName)
      }
      return db.createObjectStore(this.objectStoreName)
    },
    storeData: function(theSong, data) {
      return this.store(theSong.file, data)
      .then((e) => {
        this.config.set(theSong.file, true)
        return this.storeConfig()
      .then(() => e)
      })
    },
    store: function(key, data) {
      return new Promise((resolve, reject) => {
        let transaction = this.db.transaction([this.objectStoreName], 'readwrite')
        let os = transaction.objectStore(this.objectStoreName)
        let put = os.put(data, key)
        
        put.onsuccess = (e) => resolve(e)
        put.onerror = (e) => {
          reject(e)
        }
      })
    },

    storeConfig: function() {
      return this.store('config', this.config)
    },

    prepare: function(theSong) {

      return new Promise((resolve, reject) => {

        let transaction = this.db.transaction([this.objectStoreName], 'readonly')
        let get = transaction.objectStore(this.objectStoreName).get(theSong.file)

        get.onsuccess = (e) => {
          theSong.tempData = new Blob([e.target.result], {type: theSong.type})
          resolve()
        }
        get.onerror = (e) => {
          reject(e)
        }
      })
      .then(() => {
        theSong.URL = window.URL.createObjectURL(theSong.tempData)
        return theSong.URL
      })
    },

    hasData: function(theSong) {
      return Promise.resolve(this.config.has(theSong.file))
    },
    getConfig() {
     return new Promise((resolve, reject) => {

        let transaction = this.db.transaction([this.objectStoreName], 'readonly')
        let get = transaction.objectStore(this.objectStoreName).get('config')

        get.onsuccess = (e) => {
          this.config = e.target.result
          resolve()
        }
        get.onerror = (e) => {
          reject(e)
        }
      })
 
      
    },

    reset: function() {
      this.db.close()

      let thePromise = new Promise((resolve, reject) => {
        let deleteRequest
        deleteRequest = this.indexedDB.deleteDatabase(this.dbName)
        deleteRequest.onsuccess = (e) => {
          resolve(this.initialize())
        }
        deleteRequest.onerror = (e) => {
          reject(e)
        }
      })

      return thePromise
    },

    getDataUsage: function() {
      return new Promise((resolve, reject) => {
        let size = 0
        let cursorRequest = this.db.transaction([this.objectStoreName], 'readonly')
          .objectStore(this.objectStoreName)
          .openCursor()
        cursorRequest.onerror = (e) => reject(e)
        cursorRequest.onsuccess = (e) => {
          let cursor = e.target.result
          if(cursor) {
            size += getItemSize(cursor.value)
            cursor.continue() //on success will be called again on the next item (or with a falsey e.target.result)
          } else {
            resolve(size/1024/1024)
          }
        }
      })
    },

    clearData: function() {
      return new Promise((resolve, reject) => {
        let cursorRequest = this.db.transaction([this.objectStoreName], 'readwrite')
          .objectStore(this.objectStoreName)
          .openCursor()

        let deletionPromiseArray = []
        cursorRequest.onerror = (e) => reject(e)
        cursorRequest.onsuccess = (e) => {
          let cursor = e.target.result
          if(cursor) {
            let request = cursor.delete()

            let newPromise = new Promise((resolve, reject) => {
              request.onsuccess = () => resolve()
            })
            deletionPromiseArray.push(newPromise)

            cursor.continue() //on success will be called again on the next item (or with a falsey e.target.result)
          } else {
            Promise.all(deletionPromiseArray)
            .then(()=>resolve())
          }
        }
      })
    }
  }

}

export default storageStrategy
