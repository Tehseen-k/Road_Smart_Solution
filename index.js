const app = require('./app');
require('dotenv').config();
const port = process.env.PORT || 3000;



app.get('/', (req, res) => {
    res.send("Server isA running");
});

app.listen(port, () => {
    console.log("server is running");
});