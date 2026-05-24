const { OpenAI } = require('openai');

// Inicializamos el cliente de OpenAI configurado para Groq
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL // Redirige a los servidores de Groq
});

/**
 * Función de respaldo (Fallback) por si falla la conexión con la IA de Groq.
 * Extrae palabras clave de más de 4 caracteres del propio texto en español o inglés.
 */
function generateFallbackTags(text) {
    if (!text || typeof text !== 'string') return [];
    const cleanText = text.toLowerCase().replace(/[^\w\sáéíóúñ]/g, '');
    const words = cleanText.split(/\s+/);
    // Filtramos palabras significativas (más de 4 letras) y quitamos duplicados
    const candidates = words.filter(word => word.length > 4);
    const uniqueTags = [...new Set(candidates)];
    return uniqueTags.slice(0, 3); // Devolvemos como máximo 3 etiquetas
}

/**
 * Característica de IA 1: Genera etiquetas automáticas usando Groq
 */
async function generateTags(content) {
    try {
        console.log('--- ENVIANDO PETICIÓN DE TAGS A GROQ ---');
        const response = await openai.chat.completions.create({
            model: 'llama-3.1-8b-instant', 
            messages: [
                {
                    role: 'system',
                    content: 'You are an AI assistant that extracts exactly 3 relevant tags from a text. Return ONLY a valid raw JSON object. Do not wrap the response in markdown blocks. The JSON must look exactly like this: {"tags": ["example1", "example2", "example3"]}'
                },
                {
                    role: 'user',
                    content: `Extract 3 tags for this text:\n\n${content}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const responseContent = response.choices[0].message.content.trim();
        console.log('Respuesta cruda de Groq:', responseContent);

        const result = JSON.parse(responseContent);
        const tags = result.tags || result.Tags || Object.values(result)[0] || [];
        
        if (tags.length === 0) {
            console.log('Groq devolvió un array vacío. Usando etiquetas de respaldo...');
            return generateFallbackTags(content);
        }

        return tags;
    } catch (error) {
        console.error('--- ERROR EN GROQ (Se activan etiquetas de respaldo) ---');
        console.error(error.message);
        return generateFallbackTags(content);
    }
}

/**
 * Característica de IA 2: Genera vectores numéricos (embeddings) locales
 */
async function generateEmbedding(text) {
    try {
        console.log('--- GENERANDO EMBEDDING LOCAL ---');
        // Importación dinámica para evitar conflictos de CommonJS con ESM en Node.js
        const { pipeline } = await import('@xenova/transformers');
        
        // Cargamos el modelo de embeddings ligero de Hugging Face
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        
        // Convertimos el tensor de salida a un array estándar de números
        return Array.from(output.data);
    } catch (error) {
        console.error('Error al generar embedding local:', error);
        return [];
    }
}

module.exports = {
    generateTags,
    generateEmbedding
};