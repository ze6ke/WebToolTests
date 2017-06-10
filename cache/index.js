let express = require('express')
let app = express()
let morgan = require('morgan')

app.use(new morgan('dev'))
app.use(express.static('public'))//host application files

let port=8888
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
