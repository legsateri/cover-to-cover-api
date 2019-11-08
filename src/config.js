module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB_URL: process.env.DATABASE_URL || 'postgresql://allegrapusateri@localhost/cover-to-cover',
    TEST_DB_URL: process.env.TEST_DATABASE_URL || 'postgresql://dunder_mifflin@localhost/cover-to-cover-test',
    JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
}