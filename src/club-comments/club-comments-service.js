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
            club_id: comment.club_id
        }
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