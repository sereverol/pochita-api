const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');

app.use(express.json());
// app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cors());

app.use('/api/users', require('./routes/user'));
app.use('/api/list', require('./routes/list'));
app.use('/api/task', require('./routes/task'));
app.use('/api/step', require('./routes/step'));
app.use('/api/archive', require('./routes/archive'));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server initialized on port ${PORT}`));
