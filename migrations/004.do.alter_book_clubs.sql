ALTER TABLE book_clubs
    ADD COLUMN
        member_one INTEGER REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE book_clubs
    ADD COLUMN
        member_two INTEGER REFERENCES users(user_id) ON DELETE CASCADE;
        
ALTER TABLE book_clubs
    ADD COLUMN
        member_three INTEGER REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE book_clubs
    ADD COLUMN
        member_four INTEGER REFERENCES users(user_id) ON DELETE CASCADE;

ALTER TABLE book_clubs
    ADD COLUMN
         member_five INTEGER REFERENCES users(user_id) ON DELETE CASCADE;