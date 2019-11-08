const BookCommentsService = {
    getAllComments(knex) {
        return knex.select('*').from('book_comments')
    },

    insertComments(knex, newBookComments) {
        return knex
            .insert(newBookComments)
            .into('book_comments')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    deleteComments(knex, bookcomment_id) {
        return knex('book_comments')
            .where({bookcomment_id})
            .delete()
    },

    getById(knex, bookcomment_id) {
        return knex
            .from('book_comments')
            .select('*')
            .where('bookcomment_id', bookcomment_id)
            .first()
    }
}

module.exports = BookCommentsService