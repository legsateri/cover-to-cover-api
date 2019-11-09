const knex = require('knex');
const app = require('../src/app');
const { makeClubCommentsArray } = require('./club.comments.fixtures');
const { makeClubsArray } = require('./club.fixtures')

describe.only('Clubs Endpoints', () => {
    let db;

    before('Make Knex Instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL
        })
        app.set('db', db)
    });

    after('Disconnect From DB', () => db.destroy())

    before('Clean the Tables', () => db.raw('TRUNCATE club_comments, book_clubs RESTART IDENTITY CASCADE'))

    afterEach('Cleanup', () => db.raw('TRUNCATE  club_comments, book_clubs RESTART IDENTITY CASCADE'))

    describe('GET /api/clubs', () => {
        context('Given No Clubs', () => {
            it('Responds 200 With Empty List', () => {
                return supertest(app)
                    .get('/api/clubs')
                    .expect(200, [])
            });
        });

        context('Given There Are Clubs', () => {
            const testClubs = makeClubsArray()
            const testComments = makeClubCommentsArray()

            beforeEach('Insert Clubs', () => {
                return db
                    .into('book_clubs')
                    .insert(testClubs)
                    .then(() => {
                        return db
                            .into('club_comments')
                            .insert(testComments)
                    });
            });

            it('Responds 200 and All Clubs', () => {
                return supertest(app)
                    .get('/api/clubs')
                    .expect(200, testClubs)
            });
        });
    });

    describe('GET /api/clubs/:club_id', () => {
        context('Given No Clubs', () => {
            it('Responds 404', () => {
                const clubId = 12345
                return supertest(app)
                    .get(`/api/clubs/${clubId}`)
                    .expect(404)
            });
        });

        context('Given There Are Clubs', () => {
            const testClubs = makeClubsArray()
            const testComments = makeClubCommentsArray()

            beforeEach('Insert Clubs', () => {
                return db
                    .into('book_clubs')
                    .insert(testClubs)
                    .then(() => {
                        return db
                            .into('club_comments')
                            .insert(testComments)
                    });
            });

            it('Responds 200 and Specific Prompt', () => {
                const clubId = 2
                const expectedClub = testClubs[clubId - 1]
                return supertest(app)
                    .get(`/api/clubs/${clubId}`)
                    .expect(200, expectedClub)
            });
        });
    });

    describe('DELETE /api/clubs/:club_id', () => {
        context('Given No Clubs', () => {
            it('Responds 404', () => {
                const clubId = 12345
                return supertest(app)
                    .delete(`/api/clubs/${clubId}`)
                    .expect(404, {
                        error: { message: 'Club does not exist.' }
                    });
            });
        });

        context('Given There Are Clubs', () => {
            const testClubs = makeClubsArray()
            const testComments = makeClubCommentsArray()

            before('Insert Clubs', () => {
                return db
                    .into('book_clubs')
                    .insert(testClubs)
                    .then(() => {
                        return db
                            .into('club_comments')
                            .insert(testComments)
                    });
            });

            it('Responds 204 and Removes Club', () => {
                const idToRemove = 2
                const expectedClubs = testClubs.filter(club => club.club_id != idToRemove)

                return supertest(app)
                    .delete(`/api/clubs/${idToRemove}`)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/clubs`)
                            .expect(expectedClubs)
                    )
            });
        });
    });

    describe('PATCH /api/clubs/:club_id', () => {
        context('Given No Clubs', () => {
            it('Responds 404', () => {
                const clubId = 12345
                return supertest(app)
                    .patch(`/api/clubs/${clubId}`)
                    .expect(404, {
                        error: { message: 'Club does not exist.' }
                    });
            });
        });

        context('Given There Are Clubs', () => {
            const testClubs = makeClubsArray()
            const testComments = makeClubCommentsArray()

            beforeEach('Insert Clubs, Then Comments', () => {
                return db
                    .into('book_clubs')
                    .insert(testClubs)
                    .then(() => {
                        return db
                            .into('club_comments')
                            .insert(testComments)
                    });
            });

            it('Responds 204 and Updates Club', () => {
                const idToUpdate = 1
                const updatedClub = {
                    name: 'Updated Test Club',
                    description: 'Updated Test Club Description',
                    topic: 'Updated Test Club Topic',
                    currently_reading: '1234567890123',
                    next_meeting: '11-21-2019',
                };

                const expectedClub = {
                    ...testClubs[idToUpdate - 1],
                    ...updatedClub
                };

                return supertest(app)
                    .patch(`/api/clubs/${idToUpdate}`)
                    .send(updatedClub)
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/clubs/${idToUpdate}`)
                            .expect(expectedClub)
                    )
            });

            it('Responds 400 Wen No Required Fields Supplied', () => {
                const idToUpdate = 2
                return supertest(app)
                    .patch(`/api/clubs/${idToUpdate}`)
                    .send({ unrelatedField: 'foo' })
                    .expect(400)
            });

            it.skip('Responds 204 and Updates Subset of Fields', () => {
                const idToUpdate = 2
                const updateClub = {
                    name: 'Name was the only field changed'
                };
                const expectedClub = {
                    ...testClubs[idToUpdate - 1],
                    updateClub
                };

                return supertest(app)
                    .patch(`/api/clubs/${idToUpdate}`)
                    .send({
                        ...updateClub,
                        ignoreField: 'Should not be included'
                    })
                    .expect(204)
                    .then(res =>
                        supertest(app)
                            .get(`/api/clubs/${idToUpdate}`)
                            .expect(expectedClub)
                    )
            });
        });
    });
});