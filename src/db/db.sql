CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE message_role AS ENUM ('user', 'assistant');

CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE RESTRICT,
    file_name VARCHAR(255) NOT NULL,
    file_hash CHAR(64) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    total_pages INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE document_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE RESTRICT,
    page_number INT NOT NULL,
    page_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_document_page UNIQUE (document_id, page_number)
);

CREATE TABLE document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES document_pages(id) ON DELETE RESTRICT,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    start_char INT NOT NULL,
    end_char INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_page_chunk_index UNIQUE (page_id, chunk_index)
);

CREATE TABLE chunk_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chunk_id UUID UNIQUE NOT NULL REFERENCES document_chunks(id) ON DELETE RESTRICT,
    embedding VECTOR(1024) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE RESTRICT,
    role message_role NOT NULL,
    content TEXT NOT NULL,
    prompt_tokens INT NOT NULL,
    completion_tokens INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE message_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE RESTRICT,
    chunk_id UUID NOT NULL REFERENCES document_chunks(id) ON DELETE RESTRICT,
    rank INT NOT NULL,
    similarity_score NUMERIC(5, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_message_chunk UNIQUE (message_id, chunk_id),
    CONSTRAINT check_similarity_score CHECK (similarity_score >= 0 AND similarity_score <= 1)
);

CREATE INDEX idx_documents_conversation ON documents(conversation_id);
CREATE INDEX idx_documents_file_hash ON documents(file_hash);
CREATE INDEX idx_pages_document ON document_pages(document_id);
CREATE INDEX idx_chunks_page ON document_chunks(page_id);
CREATE INDEX idx_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_sources_message ON message_sources(message_id);
CREATE INDEX idx_message_sources_chunk ON message_sources(chunk_id);

CREATE INDEX idx_embeddings_vector ON chunk_embeddings
USING hnsw (embedding vector_cosine_ops);