import {createApp} from './app.js';

import {MovieModel} from './models/mongodb/movieModel.js';

createApp({movieModel : MovieModel})