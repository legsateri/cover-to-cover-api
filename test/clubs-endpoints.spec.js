////////////////////////////////////////////////////////////////////////////////
const { expect } = require('chai')
const knex = require('knex')
////////////////////////////////////////////////////////////////////////////////
const app = require('../src/app')
const helpers = require('./test-helpers')
////////////////////////////////////////////////////////////////////////////////

describe('Clubs Endpoints', function () {
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

    describe('GET /api/clubs', () => {
        context('Given no clubs', () => {
            it('Responds 200 and an empty list', () => {
                return supertest(app)
                    .get('/api/clubs')
                    .expect(200, [])
            })
        })

        context('Given there are clubs in the database', () => {
            beforeEach('Insert clubs', () =>
                helpers.seedClubTables(
                    db,
                    testUsers,
                    testClubs,
                    testComments,
                ))

            it('Responds 200 and all of the clubs', () => {
                const expectedClubs = testClubs
                return supertest(app)
                    .get('/api/clubs')
                    .expect(200, expectedClubs)
            })
        })
    })

    describe('POST /api/clubs', () => {
        beforeEach('Insert clubs', () =>
            helpers.seedClubTables(
                db,
                testUsers,
                testClubs,
                testComments,
            ))

        it(`Creates a club, responding 201 and the new club`, function () {
            this.retries(3)
            const newClub = {
                club_id: 10,
                name: 'Test Club',
                description: 'Test Club Description',
                topic: 'Test Club Topic',
            }
            return supertest(app)
                .post('/api/clubs')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .send(newClub)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('club_id')
                    expect(res.body.club_id).to.eql(newClub.club_id)
                    expect(res.body.name).to.eql(newClub.name)
                    expect(res.body.description).to.eql(newClub.description)
                    expect(res.body.topic).to.eql(newClub.topic)
                    expect(res.headers.location).to.eql(`/api/clubs/${res.body.club_id}`)
                })
                .expect(res =>
                    db
                        .from('book_clubs')
                        .select('*')
                        .where({ club_id: res.body.club_id })
                        .first()
                        .then(row => {
                            expect(res.body.club_id).to.eql(newClub.club_id)
                            expect(res.body.name).to.eql(newClub.name)
                            expect(res.body.description).to.eql(newClub.description)
                            expect(res.body.topic).to.eql(newClub.topic)
                        })
                )
        })
    })
})