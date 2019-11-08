const ClubCommentsService = {
    getAllComments(knex) {
        return knex.select('*').from('club_comments')
    },

    insertComments(knex, newClubComments) {
        return knex
            .insert(newClubComments)
            .into('club_comments')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    deleteComments(knex, clubcomment_id) {
        return knex('club_comments')
            .where({clubcomment_id})
            .delete()
    },

    getById(knex, clubcomment_id) {
        return knex
            .from('club_comments')
            .select('*')
            .where('clubcomment_id', clubcomment_id)
            .first()
    }
}

module.exports = ClubCommentsService