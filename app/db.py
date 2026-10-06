import sqlite3
from flask import g, current_app

SCHEMA = """
CREATE TABLE users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL CHECK (role IN ('admin','user')),
    created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE datasets (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    display_name  TEXT NOT NULL,
    key_column_id INTEGER REFERENCES columns(id),
    imported_at   TEXT DEFAULT (datetime('now')),
    imported_by   INTEGER REFERENCES users(id)
);

CREATE TABLE sheets (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    dataset_id INTEGER NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    position   INTEGER NOT NULL,
    UNIQUE (dataset_id, name)
);

CREATE TABLE columns (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    sheet_id INTEGER NOT NULL REFERENCES sheets(id) ON DELETE CASCADE,
    name     TEXT NOT NULL,
    position INTEGER NOT NULL,
    UNIQUE (sheet_id, name)
);

CREATE TABLE sheet_rows (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    sheet_id INTEGER NOT NULL REFERENCES sheets(id) ON DELETE CASCADE,
    row_num  INTEGER NOT NULL,
    UNIQUE (sheet_id, row_num)
);

CREATE TABLE cells (
    row_id    INTEGER NOT NULL REFERENCES sheet_rows(id) ON DELETE CASCADE,
    column_id INTEGER NOT NULL REFERENCES columns(id) ON DELETE CASCADE,
    value     TEXT,
    PRIMARY KEY (row_id, column_id)
);

CREATE TABLE rights (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dataset_id INTEGER NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    UNIQUE (user_id, dataset_id)
);

CREATE TABLE proposals (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id     TEXT NOT NULL,
    seq          INTEGER NOT NULL DEFAULT 0,
    dataset_id   INTEGER NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    user_id      INTEGER NOT NULL REFERENCES users(id),
    op           TEXT NOT NULL CHECK (op IN ('update_cell','insert_row','delete_row')),
    payload      TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','approved','rejected','conflicted')),
    sql_notation TEXT,
    snapshot     TEXT,
    admin_comment TEXT,
    created_at   TEXT DEFAULT (datetime('now')),
    resolved_at  TEXT,
    resolved_by  INTEGER REFERENCES users(id)
);
"""

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES,
        )
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
        g.db.execute("PRAGMA journal_mode = WAL")
        g.db.execute("PRAGMA synchronous = NORMAL")
    return g.db

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    db = get_db()
    db.executescript(SCHEMA)
    db.commit()

def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(_init_db_command)

import click
@click.command('init-db')
def _init_db_command():
    init_db()
    click.echo("БД инициализирована")