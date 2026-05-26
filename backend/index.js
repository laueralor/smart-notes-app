const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Conectado con éxito a MongoDB Atlas'))
    .catch((error) => console.error('Error al conectar a MongoDB:', error));

app.use('/api/notes', require('./routes/notes'));

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('El backend de Smart Notes está funcionando perfectamente');
});

// Arrancar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});