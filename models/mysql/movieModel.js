import mysql from 'mysql2/promise.js'

const config = {
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: '',
    database: 'moviesdb'
}

const connection = await  mysql.createConnection(config)

export class MovieModel {
  static async getAll ({ genre }) {

    const [movies] = await connection.query('SELECT title, year, director, duration, poster, rate, BIN_TO_UUID(id) AS uuid FROM movies ;')

    return movies
  }

  static async getById ({ id }) {

  }

  static async create ({ input }) {
    
  }

  static async delete ({ id }) {
    
  }

  static async update ({ id, input }) {
    
  }
}
