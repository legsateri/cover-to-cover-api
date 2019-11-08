function makeBookCommentsArray() {
    return [
        {
            bookcomment_id: 1,
            comment: 'Text Comment 1',
            name: 'Test Comment 1',
            book_id: '1234567890123',
            club_id: 1,
        },
        {
            bookcomment_id: 2,
            comment: 'Text Comment 2',
            name: 'Test Comment 2',
            book_id: '1234567890123',
            club_id: 2,
        },
        {
            bookcomment_id: 3,
            comment: 'Text Comment 3',
            name: 'Test Comment 3',
            book_id: '1234567890123',
            club_id: 3,
        },
    ]
}

module.exports = {
    makeBookCommentsArray
}