
require('dotenv').config();

/*const validateEnv = require('./config/env');
validateEnv();*/

const { API_PORT } = require('./config/env');

const app = require('./app.js')

const PORT = API_PORT

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
