let express = require('express')
let app = express()

const generateRandomData = function(bytes) {
  let retval = new Uint8Array(bytes)
  for(let i = 0;i<bytes;i++)
  {
    retval[i] = Math.floor(Math.random() * 256)
  }
  return retval
}

app.use(express.static('dist/public'))//host application files
//app.use(express.static('data'))//soft link to music directory
app.get('/data', (req, res) => {
 res.send(Buffer.from(generateRandomData(req.query.size)))
})

let port=8888
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
