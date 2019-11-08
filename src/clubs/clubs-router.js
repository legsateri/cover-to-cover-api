const path = require('path')
const express = require('express')
const xss = require('xss')
const ClubsService = require('./clubs-service')

const clubsRouter = express.Router()
const jsonParser = express.json()

const serializeClub = club => ({
    club_id: club.club_id,
    name: xss(club.name),
    description: xss(club.description),
    topic: xss(club.topic),
    currently_reading: club.currently_reading,
    next_meeting: club.next_meeting
});

clubsRouter
    .route('/')

    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        ClubsService.getAllClubs(knexInstance)
            .then(clubs => {
                res.json(clubs.map(serializeClub))
            })
            .catch(next)
    })

    .post(jsonParser, (req, res, next) => {
        const { name, description, topic, currently_reading, next_meeting } = req.body
        const newClub = { name, description, topic, currently_reading, next_meeting }

        for (const [key, value] of Object.entries(newClub)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request.` }
                })
            }
        }

        const knexInstance = req.app.get('db')
        ClubsService.insertClubs(
            knexInstance,
            newClub
        )
            .then(club => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${club.club_id}`))
                    .json(serializeClub(club))
            })
            .catch(next)
    });

clubsRouter
    .route('/:club_id')

    .all((req, res, next) => {
        const knexInstance = req.app.get('db')
        const routeParameter = req.params.club_id
        ClubsService.getById(knexInstance, routeParameter)
            .then(club => {
                if (!club) {
                    return res.status(404).json({
                        error: { message: 'Club does not exist.' }
                    })
                }
                res.club = club
                next()
            })
            .catch(next)
    })

    .get((req, res, next) => {
        res.json(serializeClub(res.club))
    })

    .delete((req, res, next) => {
        ClubsService.deleteClubs(
            req.app.get('db'),
            req.params.club_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

    .patch(jsonParser, (req, res, next) => {
        const { club_id, name, description, topic, currently_reading, next_meeting } = req.body
        const clubToUpdate = { club_id, name, description, topic, currently_reading, next_meeting }

        const numberOfValues = Object.values(clubToUpdate).filter(Boolean).length
        if (numberOfValues === 0)
            return res.status(400).json({
                error: {
                    message: `Request body must have an id, name, description, topic, current book, and next meeting.`
                }
            });

        ClubsService.updateClub(
            req.app.get('db'),
            req.params.club_id,
            clubToUpdate
        )
            .then(club => {
                res.status(204).json(serializeClub(club));
            })
            .catch(next)
    });

module.exports = clubsRouter