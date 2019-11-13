////////////////////////////////////////////////////////////////////////////////
const knex = require('knex')
const jwt = require('jsonwebtoken')
////////////////////////////////////////////////////////////////////////////////
const app = require('../src/app')
const helpers = require('./test-helpers')
////////////////////////////////////////////////////////////////////////////////

describe('Auth Endpoints', function () {
    let db

    const { testUsers } = helpers.makeClubFixtures()
    const testUser = testUsers[0]

    before('Make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('Disconnect from db', () => db.destroy())

    before('Cleanup', () => helpers.cleanTables(db))

    afterEach('Cleanup', () => helpers.cleanTables(db))

    describe(`POST /api/auth/login`, () => {
        beforeEach('Insert Users', () =>
            helpers.seedUsers(
                db,
                testUsers,
            )
        )

        const requireFields = ['email', 'password']

        requireFields.forEach(field => {
            const loginAttemptBody = {
                email: testUser.email,
                password: testUser.password,
            }

            it(`Responds 400 required error when ${field} is missing.`, () => {
                delete loginAttemptBody[field]

                return supertest(app)
                    .post('/api/auth/login')
                    .send(loginAttemptBody)
                    .expect(400, {
                        error: `Missing ${field} in request body.`,
                    })
            })
        })

        it(`Responds 400 'Incorrect email or password' when bad email.`, () => {
            const userInvalidUser = { email: 'user-not@email.com', password: 'existy' }
            return supertest(app)
                .post('/api/auth/login')
                .send(userInvalidUser)
                .expect(400, { error: `Incorrect email or password.` })
        })

        it(`Responds 400 'Incorrect email or password' when bad password.`, () => {
            const userInvalidPass = { email: testUser.email, password: 'incorrect' }
            return supertest(app)
                .post('/api/auth/login')
                .send(userInvalidPass)
                .expect(400, { error: `Incorrect email or password.` })
        })

        it(`Responds 200 and JWT auth token using secret when valid credentials.`, () => {
            const userValidCreds = {
                email: testUser.email,
                password: testUser.password,
            }
            const expectedToken = jwt.sign(
                { user_id: testUser.id },
                process.env.JWT_SECRET,
                {
                    subject: testUser.email,
                    algorithm: 'HS256',
                }
            )
            return supertest(app)
                .post('/api/auth/login')
                .send(userValidCreds)
                .expect(200, {
                    authToken: expectedToken,
                })
        })
    })
})