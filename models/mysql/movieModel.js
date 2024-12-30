import mysql from 'mysql2/promise.js'

const DEFAULT_CONFIG = {
    host: 'localhost',
    user: 'root',
    port: 3306,
    password: 'admin',
    database: 'moviesdb'
}

const connectionString = process.env.DATABASE_URL ?? DEFAULT_CONFIG

const connection = await  mysql.createConnection(connectionString)

export class MovieModel {
  static async getAll({ genre }) {
    let genreCondition = "";
    let genreParams = [];
  
    if (genre) {
      genreCondition = `WHERE LOWER(g.name) = ?`;
      genreParams.push(genre.toLowerCase());
    }
  
    const [movies] = await connection.query(
      `SELECT 
        BIN_TO_UUID(m.id) AS id, 
        m.title, 
        m.year, 
        m.director, 
        m.duration, 
        m.poster, 
        m.rate, 
        GROUP_CONCAT(g.name) AS genres
       FROM movies m
       LEFT JOIN movie_genres mg ON m.id = mg.movie_id
       LEFT JOIN genre g ON mg.genre_id = g.id
       ${genreCondition}
       GROUP BY m.id, m.title, m.year, m.director, m.duration, m.poster, m.rate`,
      genreParams
    );
  
    return movies.map(movie => ({
      ...movie,
      genres: movie.genres ? movie.genres.split(",") : []
    }));
  }
  
  static async getById ({ id }) {

    const [movies] = await connection.query(
      `SELECT 
          BIN_TO_UUID(m.id) AS id, 
          m.title, 
          m.year, 
          m.director, 
          m.duration, 
          m.poster, 
          m.rate, 
          GROUP_CONCAT(g.name) AS genres
       FROM movies m
       LEFT JOIN movie_genres mg ON m.id = mg.movie_id
       LEFT JOIN genre g ON mg.genre_id = g.id
       WHERE BIN_TO_UUID(m.id) COLLATE utf8mb4_unicode_ci = ?
       GROUP BY m.id, m.title, m.year, m.director, m.duration, m.poster, m.rate;`,
      [id]
    );
    

    return movies.map(movie => ({
      ...movie,
      genres: movie.genres ? movie.genres.split(",") : []
    }));
  }

  static async create ({ input }) {
    const {
      title,
      year,
      director,
      duration,
      poster,
      rate,
      genre
    } = input;

    //Function for get and return IDs
    const getGenreIds = async (genres) => {
      const genreIds = [];
      
      for (const g of genres) {
        // Search genre
        const [[existingGenre]] = await connection.query(
          'SELECT id FROM genre WHERE LOWER(name) = ?',
          [g.toLowerCase()]
        );
  
        if (existingGenre) {
          // Exists, add ID
          genreIds.push(existingGenre.id);
        } else {
            throw new Error(`Error genre does not exists`);
        }
      }
  
      return genreIds;
    };

    //Get new movie IDs
    const [[{ uuid }]] = await connection.query('SELECT UUID() AS uuid');

    //Insert movie into database
    try {
      await connection.query(
        `INSERT INTO movies (id, title, year, director, duration, poster, rate) 
        VALUES (UUID_TO_BIN("${uuid}"), ?, ?, ?, ?, ?, ?)`,
        [title, year, director, duration, poster, rate]     
      )
    } catch (e) {
      throw new Error('Error creating movie');
    }

    //Get IDs to genres
    const genreIds = await getGenreIds(genre);

    //Insert relations for the table movie_genre
    const movieGenreQueries = genreIds.map((genreId) =>
      connection.query(
        `INSERT INTO movie_genres (movie_id, genre_id) VALUES (UUID_TO_BIN(?), ?)`,
        [uuid, genreId]
      )
    );
    try {
      await Promise.all(movieGenreQueries);
    } catch (e) {
      throw new Error('Error creating movie-genre relation');
    }

  

    return { message: 'Movie created successfully!', movieId: uuid };

  }

  static async delete ({ id }) {
    
    try {
      const idMovie = await connection.query('SELECT * FROM movies WHERE id = UUID_TO_BIN(?)', [id]);
      if (idMovie[0].length > 0) {
        await connection.query('DELETE FROM movies WHERE id = UUID_TO_BIN(?)', [id]);
        return { message: 'Movie deleted successfully!' };
      }
      return { message: 'Movie not Exist' };
    } catch (error) {
      return false;
    }
    
      
  }

  static async update ({ id, input }) {

    const {
      title,
      year,
      director,
      duration,
      poster,
      rate,
      genre
    } = input;

    const updateMovieQuery = `
    UPDATE movies
    SET title = ?, year = ?, director = ?, duration = ?, poster = ?, rate = ?
    WHERE id = UUID_TO_BIN(?)
  `;

  const getGenreIds = async (genres) => {
    const genreIds = [];
    
    for (const g of genres) {
      // Search genre
      const [[existingGenre]] = await connection.query(
        'SELECT id FROM genre WHERE LOWER(name) = ?',
        [g.toLowerCase()]
      );

      if (existingGenre) {
        // Exists, add ID
        genreIds.push(existingGenre.id);
      } else {
          throw new Error(`Error genre does not exists`);
      }
    }

    return genreIds;
  };


    // Actualizar los datos de la película
    try {
      await connection.query(updateMovieQuery, [
        title,
        year,
        director,
        duration,
        poster,
        rate,
        id,
      ]);
    } catch (error) {
      return { status: 404, message: "Error updating movie" };
    }

    // Get new IDs genres
    const genreIds = await getGenreIds(genre);

    // Delete current relations 
    await connection.query(
      'DELETE FROM movie_genres WHERE movie_id = UUID_TO_BIN(?)',
      [id]
    );

    // Insert new relations
    const movieGenreQueries = genreIds.map((genreId) =>
      connection.query(
        `INSERT INTO movie_genres (movie_id, genre_id) VALUES (UUID_TO_BIN(?), ?)`,
        [id, genreId]
      )
    );

    try {
      await Promise.all(movieGenreQueries);
    } catch (error) {
      return { status: 400, message: "Error updating movie genres" };
    }
    
    return { message: 'Movie and genres updated successfully!' };

  }
}
