////////////////////////////////////////////////////////////////////////////////
const knex = require('knex');
const bcrypt = require('bcryptjs');
////////////////////////////////////////////////////////////////////////////////
const app = require('../src/app');
const helpers = require('./test-helpers');
////////////////////////////////////////////////////////////////////////////////

describe('Users Endpoints', function () {
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

    describe(`POST /api/users`, () => {
        context(`User Validation`, () => {
            beforeEach('Insert Users', () =>
                helpers.seedUsers(
                    db,
                    testUsers,
                )
            )

            const requiredFields = ['email', 'password', 'full_name']

            requiredFields.forEach(field => {
                const registerAttemptBody = {
                    email: 'testemail@testemail.com',
                    password: 'testPassword3',
                    full_name: 'Test Name',
                }

                it(`Responds 400 error when ${field} is missing.`, () => {
                    delete registerAttemptBody[field]

                    return supertest(app)
                        .post('/api/users')
                        .send(registerAttemptBody)
                        .expect(400, {
                            error: `Missing ${field} in request body.`,
                        })
                })

                it(`Responds 400 'Password must be longer than 8 characters.`, () => {
                    const userShortPassword = {
                        email: 'testemail@testemail.com',
                        password: '1234567',
                        full_name: 'Test Name',
                    }
                    return supertest(app)
                        .post('/api/users')
                        .send(userShortPassword)
                        .expect(400, { error: `Password must be longer than 8 characters.` })
                })

                it(`Responds 400 'Password must be less than 72 characters.`, () => {
                    const userLongPassword = {
                        email: 'testemail@testemail.com',
                        password: '*'.repeat(73),
                        full_name: 'Test Name',
                    }
                    return supertest(app)
                        .post('/api/users')
                        .send(userLongPassword)
                        .expect(400, { error: `Password must be less than 72 characters.` })
                })

                it(`Responds 400 when password starts with spaces.`, () => {
                    const userPasswordStartsSpaces = {
                        email: 'testemail@testemail.com',
                        password: ' 1Aa!2Bb@',
                        full_name: 'Test Name',
                    }
                    return supertest(app)
                        .post('/api/users')
                        .send(userPasswordStartsSpaces)
                        .expect(400, { error: `Password must not start or end with a space.` })
                })

                it(`Responds 400 when password ends with spaces.`, () => {
                    const userPasswordEndsSpaces = {
                        email: 'testemail@testemail.com',
                        password: '1Aa!2Bb@ ',
                        full_name: 'Test Name',
                    }
                    return supertest(app)
                        .post('/api/users')
                        .send(userPasswordEndsSpaces)
                        .expect(400, { error: `Password must not start or end with a space.` })
                })

                it(`Responds 400 error when password isn't complex.`, () => {
                    const userPasswordNotComplex = {
                        email: 'testemail@testemail.com',
                        password: '11AAaabb',
                        full_name: 'Test Name',
                    }
                    return supertest(app)
                        .post('/api/users')
                        .send(userPasswordNotComplex)
                        .expect(400, { error: `Password must contain one upper case, lower case, number and special character.` })
                })

                it(`Responds 400 'An account with this email already exists.`, () => {
                    const duplicateUser = {
                        email: testUser.email,
                        password: '11AAaa!!',
                        full_name: 'Test Name'
                    }
                    return supertest(app)
                        .post('/api/users')
                        .send(duplicateUser)
                        .expect(400, { error: `An account with this email already exists.` })
                })
            })

            context(`Happy path`, () => {
                it(`Responds 201, serialized user, storing bcrypted password`, () => {
                    const newUser = {
                        email: 'testemail@testemail.com',
                        password: '11AAaa!!',
                        full_name: 'Test Name',
                    }
                    return supertest(app)
                        .post('/api/users')
                        .send(newUser)
                        .expect(201)
                        .expect(res => {
                            expect(res.body).to.have.property('user_id')
                            expect(res.body.email).to.eql(newUser.email)
                            expect(res.body.full_name).to.eql(newUser.full_name)
                            expect(res.body).to.not.have.property('password')
                            expect(res.headers.location).to.eql(`/api/users/${res.body.user_id}`)
                            const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                            const actualDate = new Date(res.body.date_created).toLocaleString()
                            expect(actualDate).to.eql(expectedDate)
                        })
                        .expect(res => {
                            db
                                .from('users')
                                .select('*')
                                .where({ user_id: res.body.user_id })
                                .first()
                                .then(row => {
                                    expect(row.email).to.eql(newUser.email)
                                    expect(row.full_name).to.eql(newUser.full_name)
                                    const expectedDate = new Date().toLocaleString('en', { timeZone: 'UTC' })
                                    const actualDate = new Date(row.date_created).toLocaleString()
                                    expect(actualDate).to.eql(expectedDate)

                                    return bcrypt.compare(newUser.password, row.password)
                                })
                                .then(compareMatch => {
                                    expect(compareMatch).to.be.true
                                })
                        })
                })
            })
        })
    })
})