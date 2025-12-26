
require('dotenv').config();

const validateEnv = require('./config/env');
validateEnv();

const app = require('./app.js')

const PORT = process.env.API_PORT

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
})
