const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const aiService = require('../services/aiService'); // <--- Importamos el servicio de IA

// 1. CREATE a note with Automatic AI Features (POST)
// 1. CREATE a note with Automatic AI Features (POST)
router.post('/', async (req, res) => {
    try {
        const { title, content } = req.body;

        console.log('Generando tags con Groq...');
        const automaticTags = await aiService.generateTags(content);
        console.log('Tags generados:', automaticTags);

        console.log('Generando embedding local...');
        const vectorEmbedding = await aiService.generateEmbedding(content);
        console.log('Embedding generado con éxito (longitud):', vectorEmbedding.length);

        // Creamos la nota asegurándonos de pasarle las variables que ya tienen los datos de la IA
        const newNote = new Note({
            title,
            content,
            tags: automaticTags,
            embedding: vectorEmbedding
        });

        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (error) {
        console.error('Error en la ruta POST:', error);
        res.status(500).json({ message: 'Error creating the note with AI features', error: error.message });
    }
});

// 2. READ all notes (GET)
router.get('/', async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving notes', error });
    }
});

// 3. UPDATE a note (PUT)
router.put('/:id', async (req, res) => {
    try {
        const { title, content } = req.body;
        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            { title, content },
            { new: true }
        );
        if (!updatedNote) return res.status(404).json({ message: 'Note not found' });
        res.json(updatedNote);
    } catch (error) {
        res.status(500).json({ message: 'Error updating the note', error });
    }
});

// 4. DELETE a note (DELETE)
router.delete('/:id', async (req, res) => {
    try {
        const deletedNote = await Note.findByIdAndDelete(req.params.id);
        if (!deletedNote) return res.status(404).json({ message: 'Note not found' });
        res.json({ message: 'Note successfully deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting the note', error });
    }
});

module.exports = router;