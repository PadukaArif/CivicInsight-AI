import { db } from "../config/database"

db.run(`
CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
)
`)

db.run(`
CREATE TABLE IF NOT EXISTS profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    account_id INTEGER NOT NULL UNIQUE,

    nik TEXT NOT NULL UNIQUE,

    full_name TEXT NOT NULL,

    role TEXT NOT NULL CHECK (
        role IN ('warga', 'admin_rt', 'admin_rw')
    ),

    rt TEXT NOT NULL,
    rw TEXT NOT NULL,

    phone_number TEXT,

    is_lansia INTEGER NOT NULL DEFAULT 0,

    FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON DELETE CASCADE
)
`)