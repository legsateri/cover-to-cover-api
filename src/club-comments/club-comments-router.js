////////////////////////////////////////////////////////////////////////////////
const path = require('path')
const express = require('express')
const xss = require('xss')
////////////////////////////////////////////////////////////////////////////////
const ClubCommentsService = require('./club-comments-service')
const { requireAuth } = require('../middleware/jwt-auth')
////////////////////////////////////////////////////////////////////////////////
const clubCommentsRouter = express.Router()
const jsonParser = express.json()
////////////////////////////////////////////////////////////////////////////////

const serializeComment = comment => ({
    comment_id: comment.comment_id,
    comment: xss(comment.comment),
    user_id: comment.user_id,
    club_id: comment.club_id
})

clubCommentsRouter
    .route('/')

    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        ClubCommentsService.getAllComments(knexInstance)
            .then(comments => {
                res.json(comments.map(serializeComment))
            })
            .catch(next)
    })

    .post(requireAuth, jsonParser, (req, res, next) => {
        const { comment, user_id, club_id } = req.body
        const newClubComment = { comment, user_id, club_id }

        for (const [key, value] of Object.entries(newClubComment)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request.` }
                })
            }
        }

        const knexInstance = req.app.get('db')
        ClubCommentsService.insertComments(
            knexInstance,
            newClubComment
        )
            .then(comment => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${comment.comment_id}`))
                    .json(serializeComment(comment))
            })
            .catch(next)
    })

clubCommentsRouter
    .route('/:comment_id')

    .all(requireAuth, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const routeParameter = req.params.comment_id
        ClubCommentsService.getById(knexInstance, routeParameter)
            .then(comment => {
                if (!comment) {
                    return res.status(404).json({
                        error: { message: 'Comment does not exist.' }
                    })
                }
                res.comment = comment
                next()
            })
            .catch(next)
    })

    .get((req, res, next) => {
        res.json(serializeComment(res.comment))
    })

    .delete((req, res, next) => {
        ClubCommentsService.deleteComments(
            req.app.get('db'),
            req.params.comment_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = clubCommentsRouter