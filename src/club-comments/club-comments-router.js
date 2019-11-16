////////////////////////////////////////////////////////////////////////////////
const path = require('path')
const express = require('express')
////////////////////////////////////////////////////////////////////////////////
const ClubCommentsService = require('./club-comments-service')
const { requireAuth } = require('../middleware/jwt-auth')
////////////////////////////////////////////////////////////////////////////////
const clubCommentsRouter = express.Router()
const jsonParser = express.json()
////////////////////////////////////////////////////////////////////////////////

clubCommentsRouter
    .route('/')

    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        ClubCommentsService.getAllComments(knexInstance)
            .then(comments => {
                res.json(comments)
            })
            .catch(next)
    })

    .post(requireAuth, jsonParser, (req, res, next) => {
        const { comment, club_id } = req.body
        const newComment = { comment, club_id }

        for (const [key, value] of Object.entries(newComment))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing ${key} in request.` }
                })

        newComment.user_id = req.user.user_id

        ClubCommentsService.insertComments(
            req.app.get('db'),
            newComment
        )
            .then(comment => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${comment.comment_id}`))
                    .json(ClubCommentsService.serializeComment(comment))
            })
            .catch(next)
    })

clubCommentsRouter
    .route('/user')

    .all(requireAuth)

    .get((req, res, next) => {
        const user_id = req.user.user_id

        ClubCommentsService.getCommentsByUser(
            req.app.get('db'),
            user_id
        )
            .then(comments => {
                res.json(comments.map(ClubCommentsService.serializeCommentWithClubInfo))
            })
            .catch(next)
    })

clubCommentsRouter
    .route('/:comment_id')

    .all(requireAuth)

    .all((req, res, next) => {
        ClubCommentsService.getById(
            req.app.get('db'),
            req.params.comment_id
        )
            .then(comment => {
                if (!comment) {
                    return res.status(404).json({
                        error: { message: `Comment does not exist.` }
                    })
                }
                res.comment = comment
                next()
            })
            .catch(next)
    })

    .get((req, res, next) => {
        res.json(res.comment)
    })

    .delete((req, res, next) => {
        ClubCommentsService.deleteComments(
            req.app.get('db'),
            req.params.comment_id
        )
            .then(() => {
                res.status(204).end()
            })
            .catch(next)
    })

    .patch(jsonParser, (req, res, next) => {
        const { comment } = req.body
        updatedComment = { comment }

        ClubCommentsService.updateComment(
            req.app.get('db'),
            req.params.comment_id,
            updatedComment
        )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
    })

clubCommentsRouter
    .route('/clubs/:club_id')

    .all(requireAuth)

    .get((req, res, next) => {
        ClubCommentsService.getCommentsByClub(
            req.app.get('db'),
            req.params.club_id,
            req.user.user_id
        )
            .then(comments => {
                if(!comments.length) {
                    return res.status(404).json({
                        error: {message: `No comments exist for this club.`}
                    })
                }
                res.json(comments.map(ClubCommentsService.serializeCommentWithUser))
            })
            .catch(next)
    })

module.exports = clubCommentsRouter