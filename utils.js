import { createRequire } from 'node:module'
const require = createRequire(import.meta.url)

export const readJSON = (path) => require(path)



//Leer json en ESModules
//import fs from 'node:fs'
//const movies = JSON.parse(fs.readFileSync('./movies.json', 'utf8'))

//Leer json en ESModules
//import {createRequire} from 'node:module'
//const require = createRequire(import.meta.url)
//const movies = require('../movies.json')

//Leer json en ESModules
//import movies from '../movies.json' with {type: 'json'}