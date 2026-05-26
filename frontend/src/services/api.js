const API_URL = 'http://localhost:5000/api/notes';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
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
    const response = await fetch(`${API_URL}/auth/register`, {
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
    const response = await fetch(`${API_URL}/notes`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al obtener las notas');
    return response.json();
};

export const createNote = async (noteData) => {
    const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(noteData),
    });
    if (!response.ok) throw new Error('Error al crear la nota');
    return response.json();
};

export const searchNotes = async (query) => {
    const response = await fetch(`${API_URL}/notes/search?q=${encodeURIComponent(query)}`, {
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error en la búsqueda semántica');
    return response.json();
};

export const deleteNote = async (id) => {
    const response = await fetch(`${API_URL}/notes/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!response.ok) throw new Error('Error al eliminar la nota');
    return response.json();
};