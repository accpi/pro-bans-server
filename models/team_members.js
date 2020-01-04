const { pool } = require('../config')
const debug = require('debug');
const log = debug('express:teams');

const get = (request, response) => {
    try {
        pool.query(
            'SELECT * FROM team_members ORDER BY id ASC', 
            (error, results) => {
                if (error) {
                    log('Express (get): ' + error)
                    response.status(500).send(error)
                }
                else {
                    response.status(200).json(results.rows)
                }
            }
        )
    }
    catch (error) {
        log('Express (get): ' + error)
        response.status(500).send(error)
    }
}

const getByID = (request, response) => {
    const id = parseInt(request.params.id)

    try {
        pool.query(
            'SELECT * FROM team_members where id = $1', 
            [id], 
            (error, results) => {
                if (error) {
                    log('Express (getByID): ' + error)
                    response.status(500).send(error)
                }
                else {
                    response.status(200).json(results.rows)
                }
            }
        )
    }
    catch (error) {
        log('Express (getByID): ' + error)
        response.status(500).send(error)
    }
}

const getMembers = (request, response) => {
    const id = parseInt(request.params.id)
    try {
        pool.query(
            'SELECT users.* FROM team_members JOIN users ON team_members.user_id = users.id WHERE team_members.team_id = $1', 
            [id], 
            (error, results) => {
                if (error) {
                    log('Express (getMembers): ' + error)
                    response.status(500).send(error)
                }
                else {
                    response.status(200).json(results.rows)
                }
            }
        )
    }
    catch (error) {
        log('Express (getByID): ' + error)
        response.status(500).send(error)
    }
}

const post = (request, response) => {
    const { user_id, team_id } = request.body

    try {
        pool.query(
            'Insert INTO team_members (user_id, team_id) VALUES ($1, $2) returning *', 
            [user_id, team_id], 
            (error, results) => {
                if (error) {
                    log('Express (post): ' + error)
                    response.status(500).send(error)  
                }
                else {
                    response.status(201).send(results.rows[0])
                }
            }
        )
    }
    catch (error) {
        log('Express (post): ' + error)
        response.status(500).send(error)
    }

}

module.exports = {
    get,
    getByID,
    post,
    getMembers
}