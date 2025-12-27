
require('dotenv').config();
const logger = require('./config/logger')
/*const validateEnv = require('./config/env');
validateEnv();*/

const { API_PORT } = require('./config/env');

const app = require('./app.js')

const PORT = API_PORT

app.listen(PORT, () => {
    logger.info(`Server is running on http://localhost:${PORT}`)
})
