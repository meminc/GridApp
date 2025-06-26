const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());

app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/scenarios', require('./routes/scenarios'));
app.use('/topology', require('./routes/topology'));
app.use('/telemetry', require('./routes/telemetry'));

app.get('/', (req, res) => {
  res.send('Backend API running');
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
}); 