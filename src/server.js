require('dotenv').config();
const app = require('./app');

const PORTA = process.env.PORT || 3001;

app.listen(PORTA, () => {
    console.log(`Server is running on port ${PORTA}`);
});