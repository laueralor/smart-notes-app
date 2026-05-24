const API_URL = 'http://localhost:5000/api/notes';

export const fetchNotes = async () => {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Error al obtener las notas');
    return response.json();
};

export const createNote = async (noteData) => {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
    });
    if (!response.ok) throw new Error('Error al crear la nota');
    return response.json();
};

export const searchNotes = async (query) => {
    const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Error en la búsqueda semántica');
    return response.json();
};

export const deleteNote = async (id) => {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) throw new Error('Error al eliminar la nota');
    return response.json();
};