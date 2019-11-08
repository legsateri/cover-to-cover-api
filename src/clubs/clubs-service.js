const ClubsService = {
    getAllClubs(knex) {
        return knex.select('*').from('book_clubs')
    },

    insertClubs(knex, newClub) {
        return knex
            .insert(newClub)
            .into('book_clubs')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },

    getById(knex, club_id) {
        return knex
            .from('book_clubs')
            .select('*')
            .where('club_id', club_id)
            .first()
    },

    deleteClubs(knex, club_id) {
        return knex('book_clubs')
            .where({ club_id })
            .delete()
    },

    updateClub(knex, club_id, newClubFields) {
        return knex('book_clubs')
            .where({ club_id })
            .update(newClubFields)
    }
}

module.exports = ClubsService