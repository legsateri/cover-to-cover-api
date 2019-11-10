////////////////////////////////////////////////////////////////////////////////
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
////////////////////////////////////////////////////////////////////////////////

function makeUsersArray() {
    return [
        {
            user_id: 1,
            email: 'test-one@testemail.com',
            full_name: 'Test One',
            password: 'testPassword1',
            date_created: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            user_id: 2,
            email: 'test-two@testemail.com',
            full_name: 'Test Two',
            password: 'testPassword2',
            date_created: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            user_id: 3,
            email: 'test-three@testemail.com',
            full_name: 'Test Three',
            password: 'testPassword3',
            date_created: new Date('2029-01-22T16:28:32.615Z')
        },
        {
            user_id: 4,
            email: 'test-four@testemail.com',
            full_name: 'Test Four',
            password: 'testPassword4',
            date_created: new Date('2029-01-22T16:28:32.615Z')
        },
    ]
}

function makeClubsArray() {
    return [
        {
            club_id: 1,
            name: 'Test Club One',
            description: 'Test Club Description One',
            topic: 'Test Club Topic One',
            currently_reading: '',
            next_meeting: '',
            member_one: 1,
            member_two: 2,
            member_three: 3,
            member_four: 4,
            member_five: ''
        },
        {
            club_id: 2,
            name: 'Test Club Two',
            description: 'Test Club Description Two',
            topic: 'Test Club Topic Two',
            currently_reading: '',
            next_meeting: '',
            member_one: 1,
            member_two: 2,
            member_three: 3,
            member_four: 4,
            member_five: ''
        },
        {
            club_id: 3,
            name: 'Test Club Three',
            description: 'Test Club Description Three',
            topic: 'Test Club Topic Three',
            currently_reading: '',
            next_meeting: '',
            member_one: 1,
            member_two: 2,
            member_three: 3,
            member_four: 4,
            member_five: ''
        },
        {
            club_id: 4,
            name: 'Test Club Four',
            description: 'Test Club Description Four',
            topic: 'Test Club Topic Four',
            currently_reading: '',
            next_meeting: '',
            member_one: 1,
            member_two: 2,
            member_three: 3,
            member_four: 4,
            member_five: ''
        },
    ]
}

function makeCommentsArray(users, clubs) {
    return [
        {
            comment_id: 1,
            comment: 'Test Comment One',
            user_id: 1,
            club_id: 1
        },
        {
            comment_id: 2,
            comment: 'Test Comment Two',
            user_id: 2,
            club_id: 2
        },
        {
            comment_id: 3,
            comment: 'Test Comment Three',
            user_id: 3,
            club_id: 3
        },
        {
            comment_id: 4,
            comment: 'Test Comment Four',
            user_id: 4,
            club_id: 4
        },
    ]
}

function makeExpectedCommentsWithEmail(comments, users, user_id, club_id) {
    const removeRequestor = comments.filter(
        comment => comment.user_id !== user_id
    )

    const expectedComments = removeRequestor.filter(
        comment => comment.club_id == club_id
    )

    return expectedComments.map(comment => {
        const user = users.find(
            user => user.id === comment.user_id
        )
        return {
            club_id: comment.club_id,
            user_id: comment.user_id,
            comment: comment.comment,
            email: user.email
        }
    })
}

function makeMaliciousComment(user, club) {
    const maliciousComment = {
        comment_id: 911,
        comment: 'Bad comment.',
        club_id: 1,
        user_id: user.id,
    }

    const expectedComment = {
        ...makeExpectedCommentsWithEmail([maliciousComment], [club], [user]),
        comment: `I am a naughty little comment.`
    }

    return {
        maliciousComment,
        expectedComment
    }
}

function makeClubFixtures() {
    const testUsers = makeUsersArray()
    const testClubs = makeClubsArray()
    const testComments = makeCommentsArray(testUsers, testClubs)

    return { testUsers, testClubs, testComments }
}

function cleanTables(db) {
    return db.transaction(trx =>
        trx.raw(
            `TRUNCATE
            users,
            book_clubs,
            club_comments
            `
        )
            .then(() =>
                Promise.all([
                    trx.raw(`ALTER SEQUENCE users_user_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE book_clubs_club_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`ALTER SEQUENCE club_comments_comment_id_seq minvalue 0 START WITH 1`),
                    trx.raw(`SELECT setval('users_user_id_seq', 0)`),
                    trx.raw(`SELECT setval('book_clubs_club_id_seq', 0)`),
                    trx.raw(`SELECT setval('club_comments_comment_id_seq', 0)`)
                ])
            )
    )
}

function seedUsers(db, users) {
    const preppedUsers = users.map(user => ({
        ...user,
        password: bcrypt.hashSync(user.password, 1)
    }))
    return db.into('users').insert(preppedUsers)
        .then(() =>
            db.raw(
                `SELECT setval('users_user_id_seq', ?)`,
                [users[users.length - 1].user_id]
            )
        )
}

function seedClubTables(db, users, clubs, comments = []) {
    return db.transaction(async trx => {
        await seedUsers(trx, users)
        await trx.into('book_clubs').insert(clubs)
        await trx.raw(
            `SELECT setval('book_clubs_club_id_seq', ?)`,
            [clubs[clubs.length - 1].club_id],
        )
        if (comments.length) {
            await trx.into('club_comments').insert(comments)
            await trx.raw(
                `SELECT setval('club_comments_comment_id_seq', ?)`,
                [comments[comments.length - 1].comment_id]
            )
        }
    })
}

function seedMaliciousComment(db, user, club, comment) {
    return db.transaction(async trx => {
        await seedUsers(trx, [user])
        await trx.into('book_clubs').insert(club)
        await trx.into('club_comments').insert(comment)
    })
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ user_id: user.user_id }, secret, {
        subject: user.email,
        algorithm: 'HS256'
    })
    return `Bearer ${token}`
}

module.exports = {
    makeClubsArray,
    makeUsersArray,
    makeCommentsArray,
    makeMaliciousComment,
    makeClubFixtures,
    cleanTables,
    seedClubTables,
    seedUsers,
    makeExpectedCommentsWithEmail,
    seedMaliciousComment,
    makeAuthHeader
}