const path = require('path');
const resolvedPath = path.resolve('packages/backend/api/.env.tests');
require('dotenv').config({ path: resolvedPath});
console.log("Configuring jest " + resolvedPath)