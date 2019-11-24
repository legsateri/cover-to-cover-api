# Cover To Cover App

A virtual book club application. Users can create an account, find clubs to join, add books for the group to read, comment on the books and start their own club.

## Motivation

Book clubs are a great way to meet new people and be exposed to new things and ideas. I wanted to provide a space where anyone can read books together and discuss them.

## Environment Setup

1. Setup your own postgress server
2. Run migration files to build your table structure
3. Create a .env file in your server folder which contains the path to your database
4. Run the seed files to seed your database.
5. Run your project with
```
npm run dev
```

## Running Tests

To run tests, run
```
npm test
```

## Built With

### Back-End
* Postgress
* Express
* Node
* Knex

### Testing
* Mocha
* Chai

## Features

* GET all clubs
* DELETE individual clubs
* POST a club
* PATCH a club
* GET all comments
* DELETE individual comments
* POST a comment
* POST new users

## Demo

- [Live Demo](https://cover-to-cover-app.legsateri.now.sh/)

## Client

- [Client Repo](https://github.com/legsateri/cover-to-cover-app)