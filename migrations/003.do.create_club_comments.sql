CREATE TABLE club_comments (
    clubcomment_id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    comment TEXT NOT NULL,
    name TEXT NOT NULL,
    club_id INTEGER REFERENCES book_clubs(club_id) ON DELETE SET NULL
);