const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const aiService = require('../services/aiService');

function calculateSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
    }
    return dotProduct;
}

router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ message: 'Se requiere un término de búsqueda en el parámetro ?q=' });
        }

        console.log(`Buscando notas semánticamente para: "${query}"`);

        const queryEmbedding = await aiService.generateEmbedding(query);
        if (queryEmbedding.length === 0) {
            return res.status(500).json({ message: 'No se pudo procesar la búsqueda por IA' });
        }

        const notes = await Note.find({ embedding: { $exists: true, $not: { $size: 0 } } });

        const results = notes.map(note => {
            const similarity = calculateSimilarity(queryEmbedding, note.embedding);
            
            const noteObject = note.toObject();
            
            delete noteObject.embedding;
            
            return {
                ...noteObject,
                score: similarity
            };
        });

        results.sort((a, b) => b.score - a.score);

        res.json(results);
    } catch (error) {
        console.error('Error en búsqueda semántica:', error);
        res.status(500).json({ message: 'Error procesando la búsqueda semántica', error: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, content } = req.body;

        console.log('Generando tags con Groq...');
        const automaticTags = await aiService.generateTags(content);
        console.log('Tags generados:', automaticTags);

        console.log('Generando embedding local...');
        const vectorEmbedding = await aiService.generateEmbedding(content);
        console.log('Embedding generado con éxito (longitud):', vectorEmbedding.length);

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

router.get('/', async (req, res) => {
    try {
        const notes = await Note.find().select('-embedding').sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving notes', error });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const { title, content } = req.body;
        
        const automaticTags = await aiService.generateTags(content);
        const vectorEmbedding = await aiService.generateEmbedding(content);

        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            { 
                title, 
                content,
                tags: automaticTags,
                embedding: vectorEmbedding
            },
            { new: true }
        );
        if (!updatedNote) return res.status(404).json({ message: 'Note not found' });
        res.json(updatedNote);
    } catch (error) {
        res.status(500).json({ message: 'Error updating the note', error });
    }
});

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