import mongoose from 'mongoose'
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compress from 'compression'
import cors from 'cors'
import helmet from 'helmet'

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(cookieParser())
app.use(compress())
app.use(helmet())
app.use(cors())

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/mernproject')
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database`)
})

app.listen(9779, (err: any) => {
  if (err) {
    console.log(err)
  }
  console.info('Server started on port 9779',)
})