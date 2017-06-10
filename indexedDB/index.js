let express = require('express')
let app = express()

app.use(express.static('public'))//host application files

let port=8888
app.listen(port, () => {
  console.log(`listening on port ${port}`)
})
