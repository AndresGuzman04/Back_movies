import {createApp} from './app.js';

import {MovieModel} from './models/mysql/movieModel.js';

createApp({movieModel : MovieModel})