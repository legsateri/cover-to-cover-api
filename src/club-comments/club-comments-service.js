////////////////////////////////////////////////////////////////////////////////
const xss = require('xss')
////////////////////////////////////////////////////////////////////////////////

const ClubCommentsService = {
    insertComments(db, newComment) {
        return db
            .insert(newComment)
            .into('club_comments')
            .returning('*')
            .then(([comment]) => comment)
    },

    serializeComment(comment) {
        return {
            comment_id: comment.comment_id,
            comment: xss(comment.comment),
            club_id: comment.club_id,
            user_id: comment.user_id
        }
    },

    serializeCommentWithClubInfo(comment) {
        const {club} = comment
        return {
            comment_id: comment.comment_id,
            comment: comment.comment,
            club_id: comment.club_id,
            user_id: comment.user_id,
            club: {
                club_id: club.club_id,
                name: club.name,
                description: club.description,
                topic: club.topic,
                currently_reading: club.currently_reading,
                next_meeting: club.next_meeting,
                member_one: club.member_one,
                member_two: club.member_two,
                member_three: club.member_three,
                member_four: club.member_four,
                member_five: club.member_five
            }
        }
    },

    getCommentsByUser(db, user_id) {
        return db
            .from('club_comments AS comment')
            .select(
                'comment.comment_id',
                'comment.club_id',
                'comment.comment',
                'comment.user_id',
                db.raw(
                    `row_to_json(
                            (SELECT tmp FROM (
                                SELECT
                                    user.user_id,
                                    user.full_name,
                                    user.email,
                                    user.date_modified
                            ) tmp)
                        )
                    ) AS "user"`
                )
            )
            .leftJoin(
                'users AS user',
                'comment.user_id',
                'user.user_id',
                'user.full_name'
            )
            .where('comment.comment_id', comment_id)
            .first()
    },

    getAllComments(knex) {
        return knex
            .select('*')
            .from('club_comments')
    },

    getById(knex, comment_id) {
        return knex('club_comments')
            .where('comment_id', comment_id)
            .first()
    },

    deleteComment(knex, comment_id) {
        return knex('club_comments')
            .where({ comment_id })
            .delete()
    },

    updateComment(knex, comment_id, updatedComment) {
        return knex('club_comments')
            .where({ comment_id })
            .update(updatedComment)
    },

    getCommentsByClub(db, club_id, user_id) {
        return db
            .from('club_comments AS comment')
            .select(
                'comment.comment',
                'comment.club_id',
                'comment.user_id',
                'user.full_name'
            )
            .whereNot('comment.user_id', user_id)
            .where('comment.club_id', club_id)
            .leftJoin(
                'users AS user',
                'comment.user_id',
                'user.user_id'
            )
    },

    serializeCommentWithUser(comment) {
        return {
            comment_id: comment.comment_id,
            comment: xss(comment.comment),
            club_id: comment.club_id,
            user_id: comment.user_id,
            full_name: comment.full_name
        }
    }
}

module.exports = ClubCommentsService