ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL DEFAULT 'operator';
UPDATE users SET role='superroot' WHERE id=1;
UPDATE users SET role='root' WHERE id=5;
