const { OpenAI } = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL 
});


function generateFallbackTags(text) {
    if (!text || typeof text !== 'string') return [];
    const cleanText = text.toLowerCase().replace(/[^\w\sáéíóúñ]/g, '');
    const words = cleanText.split(/\s+/);
    const candidates = words.filter(word => word.length > 4);
    const uniqueTags = [...new Set(candidates)];
    return uniqueTags.slice(0, 3); 
}

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


async function generateEmbedding(text) {
    try {
        console.log('--- GENERANDO EMBEDDING LOCAL ---');
        const { pipeline } = await import('@xenova/transformers');
       
        const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        
        const output = await extractor(text, { pooling: 'mean', normalize: true });
        
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