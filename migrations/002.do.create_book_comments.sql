CREATE TABLE book_comments (
    bookcomment_id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    comment TEXT NOT NULL
    book_id TEXT,
    club_id INTEGER REFERENCES book_clubs(club_id) ON DELETE SET NULL
);