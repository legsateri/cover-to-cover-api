module.exports = {
    PORT: process.env.PORT || 9000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres@localhost/cover-to-cover',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://postgres@localhost/cover-to-cover-test',
    JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
}