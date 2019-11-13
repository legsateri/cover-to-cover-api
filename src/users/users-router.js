////////////////////////////////////////////////////////////////////////////////
const express = require('express')
const path = require('path')
////////////////////////////////////////////////////////////////////////////////
const UsersService = require('./users-service')
////////////////////////////////////////////////////////////////////////////////
const usersRouter = express.Router()
const jsonParser = express.json()
////////////////////////////////////////////////////////////////////////////////

usersRouter
    .post('/', jsonParser, (req, res, next) => {
        const { password, email, full_name } = req.body

        for (const field of ['full_name', 'email', 'password'])
            if (!req.body[field])
                return res.status(400).json({
                    error: `Missing ${field} in request body.`
                })

        const passwordError = UsersService.validatePassword(password)

        if (passwordError)
            return res.status(400).json({ error: passwordError })

        UsersService.hasUserWithEmail(
            req.app.get('db'),
            email
        )
            .then(hasUserWithEmail => {
                if (hasUserWithEmail)
                    return res.status(400).json({ error: `An account with this email already exists.` })

                return UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            email,
                            password: hashedPassword,
                            full_name,
                            date_created: 'now()'
                        }

                        return UsersService.insertUser(
                            req.app.get('db'),
                            newUser
                        )
                            .then(user => {
                                res
                                    .status(201)
                                    .location(path.posix.join(req.originalUrl, `/${user.uesr_id}`))
                                    .json(UsersService.serializeUser(user))
                            })
                    })
            })
            .catch(next)
    })

module.exports = usersRouter