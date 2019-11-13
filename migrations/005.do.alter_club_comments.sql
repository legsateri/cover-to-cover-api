ALTER TABLE club_comments
    ADD COLUMN
        user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE NOT NULL;

ALTER TABLE club_comments
    ADD COLUMN
        club_id INTEGER REFERENCES book_clubs(club_id) ON DELETE SET NULL;