const API_BASE_URL = 'http://localhost:5000/api';
const NOTES_URL = `${API_BASE_URL}/notes`
const AUTH_URL = `${API_BASE_URL}/auth`

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const loginUser = async (email, password) => {
    const response = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en las credenciales');
    }
    return response.json();
};

export const registerUser = async (email, password) => {
    const response = await fetch(`${AUTH_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar usuario');
    }
    return response.json();
};

export const fetchNotes = async () => {
    const response = await fetch(`${NOTES_URL}`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener las notas');
    return response.json();
};

export const createNote = async (noteData) => {
    const response = await fetch(`${NOTES_URL}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(noteData),
    });
    if (!response.ok) throw new Error('Error al crear la nota');
    return response.json();
};

export const searchNotes = async (query) => {
    const response = await fetch(`${NOTES_URL}/search?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error en la búsqueda semántica');
    return response.json();
};

export const deleteNote = async (id) => {
    const response = await fetch(`${NOTES_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al eliminar la nota');
    return response.json();
};