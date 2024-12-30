import express, { json } from 'express' 
import {corsMiddleware} from './middlewares/cors.js'
import { createMovieRouter } from './routes/moviesRoutes.js'
import 'dotenv/config'

export const createApp = ({movieModel}) => {
  const app = express()

  app.use(json())

  app.use(corsMiddleware())

  app.disable('x-powered-by') // deshabilitar el header X-Powered-By: Express

  app.use('/movies', createMovieRouter({movieModel})) // ruta para movies

  const PORT = process.env.PORT ?? 1234

  app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
  })
}


