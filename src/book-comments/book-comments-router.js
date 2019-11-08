const path = require('path')
const express = require('express')
const xss = require('xss')
const BookCommentsService = require('./book-comments-service')

const bookCommentsRouter = express.Router()
const jsonParser = express.json()

const serializeComment = comment => ({
    bookcomment_id: comment.comment_id,
    comment: xss(comment.comment),
    name: xss(comment.name),
    book_id: comment.book_id,
    club_id: comment.club_id
})

bookCommentsRouter
    .route('/')

    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookCommentsService.getAllComments(knexInstance)
            .then(comments => {
                res.json(comments.map(serializeComment))
            })
            .catch(next)
    })

    .post(jsonParser, (req, res, next) => {
        const { comment, name, book_id, club_id } = req.body
        const newComment = { comment, name, book_id, club_id }

        for (const [key, value] of Object.entries(newComment)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing ${key} in request.` }
                })
            }
        }

        const knexInstance = req.app.get('db')
        BookCommentsService.insertComments(
            knexInstance,
            newComment
        )
            .then(comment => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${comment.comment_id}`))
                    .json(serializeComment(comment))
            })
            .catch(next)
    })

bookCommentsRouter
    .route('/:comment_id')

    .all((req, res, next) => {
        const knexInstance = req.app.get('db')
        const routeParameter = req.params.comment_id
        BookCommentsService.getById(knexInstance, routeParameter)
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
        BookCommentsService.deleteComments(
            req.app.get('db'),
            req.params.comment_id
        )
            .then(numRowsAffected => {
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = bookCommentsRouter