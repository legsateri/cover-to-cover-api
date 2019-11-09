BEGIN;

TRUNCATE
    book_clubs,
    club_comments,
    users
    RESTART IDENTITY CASCADE;

INSERT INTO users (
    email,
    full_name,
    password
    ) VALUES
    (
        'test-one@testemail.com',
        'Test One',
        '$2a$12$fgQZdIWtKiF4SsqtqWlVau3YaJ0m.URYRD1sZfyGeekWqJnn1GyzO'
    ),
    (
        'test-two@testemail.com',
        'Test Two',
        '$2a$12$pfO0zdMXb.FXhMk9kPpUuOPMP6rzQfrVExigI.WSA4dUZpIEo6okq'
    ),
    (
        'test-three@testemail.com',
        'Test Three',
        '$2a$12$dXesKXbcIipOEAZDHa/u2e7/wkhGXPZSsggUi.rEC7L0SBG9IH0U2'
    );

INSERT INTO book_clubs (
    name, 
    description, 
    topic, 
    currently_reading, 
    next_meeting
    ) VALUES 
    (
        'UCWbLadies',
        'Four gals worked at the writing center. Now they read things.',
        'Whatevah we want',
        '9781101980385',
        '11-21-2019'
    );

INSERT INTO club_comments (
    comment,
    user_id,
    club_id
    ) VALUES
    (
        'Hey guys, what should we read next?',
        1,
        1
    ),
    (
        'No idea, whose turn is it to pick, anyway?',
        2,
        1
    ),
    (
        'Yours lol',
        3,
        1
    );

COMMIT; 