-- 1. EXTENSIONES Y ENUMS
CREATE EXTENSION IF NOT EXISTS vector;

-- Rol en el historial del chat
CREATE TYPE message_role AS ENUM ('user', 'assistant');

-- 2. TABLA DE CONVERSACIONES
-- No hay tabla de usuarios: la conversación se identifica por su propio id (UUID),
-- que el cliente guarda localmente (cookie/localStorage) para mantener el hilo.
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Identificador único de la conversación (persistido en cliente)
    title VARCHAR(255) NOT NULL,                  -- Título asignado a la conversación
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Fecha y hora de inicio del chat
    updated_at TIMESTAMP WITH TIME ZONE  -- Fecha y hora del último mensaje o actualización
);

-- 3. TABLA DE DOCUMENTOS
-- Relación 1:1 con conversations: cada documento pertenece a una única conversación.
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Identificador único global del documento
    conversation_id UUID UNIQUE NOT NULL REFERENCES conversations(id) ON DELETE RESTRICT, -- Conversación única a la que está ligado este documento
    file_name VARCHAR(255) NOT NULL,              -- Nombre original del archivo subido
    file_hash CHAR(64) NOT NULL,                  -- Hash SHA-256 para validación de contenido único
    file_size_bytes BIGINT NOT NULL,              -- Tamaño del archivo expresado en bytes
    total_pages INT NOT NULL,                     -- Cantidad total de páginas detectadas en el documento
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Fecha y hora en que se procesó/subió el archivo
);

-- 4. PÁGINAS DEL DOCUMENTO
CREATE TABLE document_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Identificador único de la página
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE RESTRICT, -- Documento origen de esta página
    page_number INT NOT NULL,                     -- Número secuencial de la página en el documento
    page_text TEXT NOT NULL,                      -- Texto completo extraído de la página sin fragmentar
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Fecha y hora de procesamiento de la página
    CONSTRAINT unique_document_page UNIQUE (document_id, page_number) -- Control de duplicados de páginas por documento
);

-- 5. CHUNKS (Fragmentos de texto)
CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Identificador único del fragmento/chunk
    page_id UUID NOT NULL REFERENCES document_pages(id) ON DELETE RESTRICT, -- Página origen del fragmento
    chunk_index INT NOT NULL,                     -- Orden secuencial del chunk dentro de la página
    chunk_text TEXT NOT NULL,                        -- Extracto de texto del fragmento
    start_char INT NOT NULL,                      -- Posición inicial del carácter dentro del texto de la página
    end_char INT NOT NULL,                        -- Posición final del carácter dentro del texto de la página
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Fecha y hora de creación del chunk
    CONSTRAINT unique_page_chunk_index UNIQUE (page_id, chunk_index) -- Índice único de chunk por página
);

-- 6. EMBEDDINGS DE LOS CHUNKS
CREATE TABLE chunk_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Identificador único del vector
    chunk_id UUID UNIQUE NOT NULL REFERENCES document_chunks(id) ON DELETE RESTRICT, -- Chunk asociado 1:1 a este embedding
    embedding VECTOR(1024) NOT NULL,               -- Vector de 1024 dimensiones para búsquedas de similitud
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Fecha y hora de generación del embedding
);

-- 7. MENSAJES DEL CHAT
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Identificador único del mensaje
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE RESTRICT, -- Conversación a la que pertenece el mensaje
    role message_role NOT NULL,                   -- Emisor del mensaje ('user' o 'assistant')
    content TEXT NOT NULL,                        -- Contenido del mensaje enviado o generado
    prompt_tokens INT NOT NULL,                   -- Cantidad de tokens consumidos en el prompt de entrada
    completion_tokens INT NOT NULL,               -- Cantidad de tokens generados en la respuesta
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() -- Fecha y hora de registro del mensaje
);

-- 8. FUENTES / CHUNKS USADOS POR MENSAJE
CREATE TABLE message_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Identificador único del registro de fuente
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE RESTRICT, -- Mensaje del asistente que cita la fuente
    chunk_id UUID NOT NULL REFERENCES document_chunks(id) ON DELETE RESTRICT,  -- Chunk de contexto utilizado
    rank INT NOT NULL,                            -- Posición de prioridad de la fuente obtenida en la búsqueda
    similarity_score NUMERIC(5, 4) NOT NULL,      -- Puntuación de similitud coseno obtenida (entre 0.0000 y 1.0000)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Fecha y hora en que se guardó la referencia
    CONSTRAINT unique_message_chunk UNIQUE (message_id, chunk_id), -- Evita duplicar el mismo chunk en una sola respuesta
    CONSTRAINT check_similarity_score CHECK (similarity_score >= 0 AND similarity_score <= 1) -- Valida el rango del score
);

-- -----------------------------------------------------------------------------
-- ÍNDICES DE RENDIMIENTO
-- -----------------------------------------------------------------------------
CREATE INDEX idx_documents_file_hash ON documents (file_hash);
CREATE INDEX idx_pages_document ON document_pages(document_id);
CREATE INDEX idx_chunks_page ON document_chunks(page_id);
CREATE INDEX idx_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_sources_message ON message_sources(message_id);
CREATE INDEX idx_message_sources_chunk ON message_sources(chunk_id);

-- Índice HNSW para búsqueda vectorial rápida por distancia coseno
CREATE INDEX idx_embeddings_vector ON chunk_embeddings 
USING hnsw (embedding vector_cosine_ops);