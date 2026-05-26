import { useState, useEffect } from 'react';
import { fetchNotes, createNote, searchNotes, deleteNote, loginUser, registerUser } from './services/api';
import './App.css';

function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [notes, setNotes] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [newNote, setNewNote] = useState({ title: '', content: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [authForm, setAuthForm] = useState({ email: '', password: '' });
    const [authError, setAuthError] = useState('');

    useEffect(() => {
        if (token) {
            loadAllNotes();
        }
    }, [token]);

    const loadAllNotes = async () => {
        try {
            const data = await fetchNotes();
            setNotes(data);
        } catch (error) {
            console.error("Error cargando notas:", error);
            if (error.message.includes('401')) handleLogout();
        }
    };

    const handleAuthSubmit = async (e) => {
        e.preventDefault();
        setAuthError('');
        setIsProcessing(true);
        try {
            let data;
            if (isRegisterMode) {
                data = await registerUser(authForm.email, authForm.password);
            } else {
                data = await loginUser(authForm.email, authForm.password);
            }
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setAuthForm({ email: '', password: '' });
        } catch (error) {
            setAuthError(error.message);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setNotes([]);
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

    if (!token) {
        return (
            <div className="container auth-container">
                <h1>Smart Notes</h1>
                <div className="controls-section">
                    <h2>{isRegisterMode ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
                    {authError && <p className="error-message">ERROR {authError}</p>}
                    
                    <form onSubmit={handleAuthSubmit} className="create-form">
                        <input
                            type="email"
                            placeholder="Tu correo electrónico..."
                            value={authForm.email}
                            onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Contraseña..."
                            value={authForm.password}
                            onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                            required
                        />
                        <button type="submit" disabled={isProcessing}>
                            {isProcessing ? 'Verificando...' : isRegisterMode ? 'Registrarse' : 'Entrar'}
                        </button>
                    </form>
                    
                    <button
                        onClick={() => { setIsRegisterMode(!isRegisterMode); setAuthError(''); }}
                        className="delete-btn"
                        style={{ marginTop: '1rem', width: '100%' }}
                    >
                        {isRegisterMode ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <header className="app-header">
                <h1>Smart Notes Application</h1>
                <button onClick={handleLogout} className="delete-btn">Cerrar Sesión</button>
            </header>

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
                <h2>Tus Notas Inteligentes</h2>
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