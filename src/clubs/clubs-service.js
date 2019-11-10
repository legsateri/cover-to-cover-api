////////////////////////////////////////////////////////////////////////////////
const xss = require('xss')
////////////////////////////////////////////////////////////////////////////////

const ClubsService = {
    getAllClubs(knex) {
        return knex
            .select('*')
            .from('book_clubs')
    },

    insertClubs(db, newClub) {
        return db
            .insert(newClub)
            .into('book_clubs')
            .returning('*')
            .then(([club]) => club)
    },

    serializeClub(club) {
        return {
            club_id: club.club_id,
            name: xss(club.name),
            description: xss(club.description),
            topic: xss(club.topic),
            currently_reading: club.currently_reading,
            next_meeting: club.next_meeting,
            member_one: club.member_one,
            member_two: club.member_two,
            member_three: club.member_three,
            member_four: club.member_four,
            member_five: club.member_five
        }
    },

    getById(knex, club_id) {
        return knex('book_clubs')
            .where('club_id', club_id)
            .first()
    },

    deleteClubs(knex, club_id) {
        return knex('book_clubs')
            .where({ club_id })
            .delete()
    },

    updateClub(knex, club_id, updatedClub) {
        return knex('book_clubs')
            .where({ club_id })
            .update(updatedClub)
    }
}

module.exports = ClubsService