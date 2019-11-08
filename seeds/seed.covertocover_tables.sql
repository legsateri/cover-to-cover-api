BEGIN;

TRUNCATE
    book_clubs,
    book_comments,
    club_comments
    RESTART IDENTITY CASCADE;

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

INSERT INTO book_comments (
    comment,
    name,
    book_id,
    club_id
    ) VALUES
    (
        'I would never have thought a great grandmothers experience would still cause trauma to her great granddaughter.',
        'T-Money',
        '9781101980385',
        1
    );

INSERT INTO club_comments (
    comment,
    name,
    club_id
    ) VALUES
    (
        'Hey guys, what should we read next?',
        'LeggyRo',
        1
    ),
    (
        'No idea, whose turn is it to pick, anyway?',
        'T-Money',
        1
    ),
    (
        'Yours lol',
        'Mag Millz',
        1
    );

COMMIT;