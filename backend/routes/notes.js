const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const aiService = require('../services/aiService');
const auth = require('../services/authMiddleware'); 

function calculateSimilarity(vecA, vecB) {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    let dotProduct = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
    }
    return dotProduct;
}

router.get('/search', auth, async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.status(400).json({ message: 'Missing query parameter q' });

        console.log(`Searching notes semantically for: "${query}"`);

        const queryEmbedding = await aiService.generateEmbedding(query);
        if (queryEmbedding.length === 0) {
            return res.status(500).json({ message: 'Could not process AI search query' });
        }
        
        const notes = await Note.find({ user: req.user, embedding: { $exists: true, $not: { $size: 0 } } });

        const results = notes.map(note => {
            const similarity = calculateSimilarity(queryEmbedding, note.embedding);
            const noteObject = note.toObject();
            
            delete noteObject.embedding;
            
            return { ...noteObject, score: similarity };
        });

        results.sort((a, b) => b.score - a.score);
        res.json(results);
    } catch (error) {
        console.error('Error in semantic search:', error);
        res.status(500).json({ message: 'Search query error', error: error.message });
    }
});

router.post('/', auth, async (req, res) => {
    try {
        const { title, content } = req.body;

        console.log('Generating automatic tags via Groq...');
        const automaticTags = await aiService.generateTags(content);
        console.log('Tags generated successfully:', automaticTags);

        console.log('Generating local vector embedding...');
        const vectorEmbedding = await aiService.generateEmbedding(content);
        console.log('Embedding generated successfully (length):', vectorEmbedding.length);

        const newNote = new Note({
            user: req.user,
            title,
            content,
            tags: automaticTags,
            embedding: vectorEmbedding
        });

        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (error) {
        console.error('Error in POST route:', error);
        res.status(500).json({ message: 'Error creating note', error: error.message });
    }
});

router.get('/', auth, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user }).select('-embedding').sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        console.error('Error retrieving notes:', error);
        res.status(500).json({ message: 'Error reading notes', error });
    }
});

router.put('/:id', auth, async (req, res) => {
    try {
        const { title, content } = req.body;
        
        const note = await Note.findOne({ _id: req.params.id, user: req.user });
        if (!note) return res.status(404).json({ message: 'Note not found or unauthorized' });

        const automaticTags = await aiService.generateTags(content);
        const vectorEmbedding = await aiService.generateEmbedding(content);

        note.title = title;
        note.content = content;
        note.tags = automaticTags;
        note.embedding = vectorEmbedding;

        await note.save();
        res.json(note);
    } catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({ message: 'Error updating note', error });
    }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        const deletedNote = await Note.findOneAndDelete({ _id: req.params.id, user: req.user });
        if (!deletedNote) return res.status(404).json({ message: 'Note not found or unauthorized' });
        
        res.json({ message: 'Note successfully deleted' });
    } catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({ message: 'Error deleting note', error });
    }
});

module.exports = router;