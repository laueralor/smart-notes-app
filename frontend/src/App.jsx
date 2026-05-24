import { useState, useEffect } from 'react';
import { fetchNotes, createNote, searchNotes, deleteNote } from './services/api';
import './App.css';

function App() {
    const [notes, setNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newNote, setNewNote] = useState({ title: '', content: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        loadAllNotes();
    }, []);

    const loadAllNotes = async () => {
        try {
            const data = await fetchNotes();
            setNotes(data);
        } catch (error) {
            console.error("Error cargando notas:", error);
        }
    };

    const handleCreateSubmit = async (event) => {
        event.preventDefault();
        setIsProcessing(true);
        try {
            await createNote(newNote);
            setNewNote({ title: '', content: '' });
            await loadAllNotes();
        } catch (error) {
            console.error("Error creando la nota:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSearchSubmit = async (event) => {
        event.preventDefault();
        if (!searchQuery.trim()) {
            await loadAllNotes();
            return;
        }
        setIsProcessing(true);
        try {
            const results = await searchNotes(searchQuery);
            setNotes(results);
        } catch (error) {
            console.error("Error en la búsqueda:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteNote(id);
            await loadAllNotes();
        } catch (error) {
            console.error("Error eliminando la nota:", error);
        }
    };

    return (
        <div className="container">
            <h1>Smart Notes Application</h1>

            <section className="controls-section">
                <form onSubmit={handleSearchSubmit} className="search-form">
                    <input
                        type="text"
                        placeholder="Busca por contexto o significado..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" disabled={isProcessing}>Buscar</button>
                </form>
            </section>

            <section className="create-section">
                <h2>Crear Nueva Nota</h2>
                <form onSubmit={handleCreateSubmit} className="create-form">
                    <input
                        type="text"
                        placeholder="Título de la nota"
                        value={newNote.title}
                        onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                        required
                    />
                    <textarea
                        placeholder="Escribe el contenido..."
                        value={newNote.content}
                        onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                        required
                    />
                    <button type="submit" disabled={isProcessing}>
                        {isProcessing ? 'Procesando IA...' : 'Guardar Nota'}
                    </button>
                </form>
            </section>

            <section className="notes-display">
                <h2>Tus Notas</h2>
                <div className="notes-grid">
                    {notes.map((note) => (
                        <div key={note._id} className="note-card">
                            <h3>{note.title}</h3>
                            <p>{note.content}</p>
                            
                            <div className="tags-container">
                                {note.tags && note.tags.map((tag, index) => (
                                    <span key={index} className="tag-badge">#{tag}</span>
                                ))}
                            </div>

                            {note.score !== undefined && (
                                <p className="relevance-score">
                                    Similitud: {(note.score * 100).toFixed(2)}%
                                </p>
                            )}

                            <button onClick={() => handleDelete(note._id)} className="delete-btn">
                                Eliminar
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default App;