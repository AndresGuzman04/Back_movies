import {createApp} from './app.js';

import {MovieModel} from './models/local-file-system/movieModel.js';

createApp({movieModel : MovieModel})