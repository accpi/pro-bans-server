const { pool } = require('../config')
const debug = require('debug');
const log = debug('express:champions');

const get = (request, response) => {
    try {
        pool.query(
            'SELECT * FROM champions ORDER BY id ASC', 
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
            'SELECT * FROM champions where id = $1', 
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

const post = (request, response) => {
    const { id, name, display_name } = request.body

    try {
        pool.query(
            'Insert INTO champions (id, name, display_name) VALUES ($1, $2, $3) returning *', 
            [id, name, display_name], 
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
    post
}