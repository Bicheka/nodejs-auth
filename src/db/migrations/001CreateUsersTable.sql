CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    email_verified BOOLEAN,
    password TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
);