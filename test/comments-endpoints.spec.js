////////////////////////////////////////////////////////////////////////////////
const { expect } = require('chai')
const knex = require('knex')
////////////////////////////////////////////////////////////////////////////////
const app = require('../src/app')
const helpers = require('./test-helpers')
////////////////////////////////////////////////////////////////////////////////

describe('Comments Endpoints', function () {
    let db

    const {
        testUsers,
        testClubs,
        testComments,
    } = helpers.makeClubFixtures()

    before('Make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('Disconnect from db', () => db.destroy())

    before('Clean the tables', () => helpers.cleanTables(db))

    afterEach('Cleanup', () => helpers.cleanTables(db))

    describe('POST /api/comments', () => {
        beforeEach('Insert comments', () =>
            helpers.seedClubTables(
                db,
                testUsers,
                testClubs,
            )
        )

        it(`Creates a comment, responds 201 and new comment.`, function () {
            this.retries(3)
            const testClub = testClubs[0]
            const newComment = {
                comment: 'Test Comment',
                club_id: testClub.club_id
            }
            return supertest(app)
                .post('/api/comments')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(newComment)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('comment_id')
                    expect(res.body.club_id).to.eql(newComment.club_id)
                    expect(res.body.comment).to.eql(newComment.comment)
                    expect(res.headers.location).to.eql(`/api/comments/${res.body.comment_id}`)
                })
                .expect(res =>
                    db
                        .from('club_comments')
                        .select('*')
                        .where({ id: res.body.id })
                        .first()
                        .then(row => {
                            expect(res.body.club_id).to.eql(newComment.club_id)
                            expect(res.body.comment).to.eql(newComment.comment)
                        })
                )
        })
    })

    describe(`GET /api/comments/:comment_id`, () => {
        context('Given no comments', () => {
            beforeEach('Insert users', () =>
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            it('Responds 404', () => {
                const comment_id = 12345
                return supertest(app)
                    .get(`/api/comments/${comment_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { error: { message: `Comment does not exist.` } })
            })
        })

        context('Given there are comments in database', () => {
            beforeEach('Insert comments', () =>
                helpers.seedClubTables(
                    db,
                    testUsers,
                    testClubs,
                    testComments,
                )
            )

            it('Responds 200 and returns expected comment', () => {
                const comment_id = 2
                const expectedComment = testComments[comment_id - 1]
                return supertest(app)
                    .get(`/api/comments/${comment_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedComment)
            })
        })
    })

    describe(`DELETE /api/comments/:comment_id`, () => {
        context('Given no comments', () => {
            beforeEach('Insert users', () =>
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            it('Responds with 404', () => {
                const comment_id = 12345
                return supertest(app)
                    .delete(`/api/comments/${comment_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { error: { message: `Comment does not exist.` } })
            })
        })
    })

    describe(`PATCH /api/comments/:comment_id`, () => {
        context('Given no comments', () => {
            beforeEach('Insert users', () =>
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            it('Responds 404', () => {
                const comment_id = 12345
                return supertest(app)
                    .patch(`/api/comments/${comment_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { error: { message: `Comment does not exist.` } })
            })
        })

        context('Given there are comments in the database', () => {
            beforeEach('Insert comment', () =>
                helpers.seedClubTables(
                    db,
                    testUsers,
                    testClubs,
                    testComments,
                )
            )

            it('Responds 204 for update and checks correct change', () => {
                const idToUpdate = 2
                const updatedComment = {
                    comment: 'Updated Test Comment',
                }
                const expectedComments = {
                    ...testComments[idToUpdate - 1],
                    ...updatedComment
                }

                return supertest(app)
                    .patch(`/api/comments/${idToUpdate}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .send(updatedComment)
                    .expect(204)
                    .then(() =>
                        supertest(app)
                            .get(`/api/comments/${idToUpdate}`)
                            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                            .expect(expectedComments)
                    )
            })
        })
    })

    describe(`GET /api/comments/clubs/:club_id`, () => {
        context('Given no comments', () => {
            beforeEach('Insert users', () =>
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            it('Responds 404', () => {
                const club_id = 12345
                return supertest(app)
                    .get(`/api/comments/clubs/${club_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(404, { error: { message: `No comments exist for this club.` } })
            })
        })

        context('Given there are comments in database', () => {
            beforeEach('Insert comments', () =>
                helpers.seedClubTables(
                    db,
                    testUsers,
                    testClubs,
                    testComments,
                )
            )

            it('Responds 200 and returns expected comments without users own review', () => {
                const club_id = 1
                const user_id = 1

                const expectedComments = helpers.makeExpectedCommentsWithEmail(
                    testComments,
                    testUsers,
                    user_id,
                    club_id
                )
                return supertest(app)
                    .get(`/api/comments/clubs/${club_id}`)
                    .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                    .expect(200, expectedComments)
            })
        })
    })
})