////////////////////////////////////////////////////////////////////////////////
const path = require('path')
const express = require('express')
////////////////////////////////////////////////////////////////////////////////
const ClubsService = require('./clubs-service')
const { requireAuth } = require('../middleware/jwt-auth')
////////////////////////////////////////////////////////////////////////////////
const clubsRouter = express.Router()
const jsonParser = express.json()
////////////////////////////////////////////////////////////////////////////////

clubsRouter
    .route('/')

    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        ClubsService.getAllClubs(knexInstance)
            .then(clubs => {
                res.json(clubs)
            })
            .catch(next)
    })

    .post(requireAuth, jsonParser, (req, res, next) => {
        const { name, description, topic } = req.body
        const newClub = { name, description, topic }

        for (const [key, value] of Object.entries(newClub))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing ${key} in request.` }
                })

        ClubsService.insertClubs(
            req.app.get('db'),
            newClub
        )
            .then(club => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${club.club_id}`))
                    .json(ClubsService.serializeClub(club))
            })
            .catch(next)
    });

clubsRouter
    .route('/:club_id')

    .all(requireAuth)

    .all((req, res, next) => {
        ClubsService.getById(
            req.app.get('db'),
            req.params.club_id
        )
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
        res.json(res.club)
    })

    .delete((req, res, next) => {
        ClubsService.deleteClubs(
            req.app.get('db'),
            req.params.club_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

    .patch(jsonParser, (req, res, next) => {
        const { name, description, topic, currently_reading, next_meeting, member_one, member_two, member_three, member_four, member_five } = req.body
        updatedClub = { name, description, topic, currently_reading, next_meeting, member_one, member_two, member_three, member_four, member_five }

        ClubsService.updateClub(
            req.app.get('db'),
            req.params.club_id,
            updatedClub
        )
            .then(() => {
                res.status(204).end();
            })
            .catch(next)
    });

module.exports = clubsRouter;