const { pool } = require('../config')
const debug = require('debug');
const log = debug('xexpress:teams');

const get = (request, response) => {
    try {
        pool.query(
            'SELECT * FROM match_histories ORDER BY id ASC', 
            (error, results) => {
                if (error) {
                    response.status(500).send(error)
                }
                else {
                    response.status(200).json(results.rows)
                }
            }
        )
    }
    catch (error) {
        response.status(500).send(error)
    }
}

const getByID = (request, response) => {
    const id = parseInt(request.params.id)

    try {
        pool.query(
            'SELECT * FROM match_histories where id = $1', 
            [id], 
            (error, results) => {
                if (error) {
                    response.status(500).send(error)
                }
                else {
                    response.status(200).json(results.rows)
                }
            }
        )
    }
    catch (error) {
        response.status(500).send(error)
    }
}

const getByUserID = (request, response) => {
    const id = parseInt(request.params.id)

    try {
        pool.query(
            'SELECT * FROM match_histories where user_id = $1 ORDER BY match_date', 
            [id], 
            (error, results) => {
                if (error) {
                    response.status(500).send(error)
                }
                else {
                    response.status(200).json(results.rows)
                }
            }
        )
    }
    catch (error) {
        response.status(500).send(error)
    }
}

const post = (request, response) => {
    const { user_id, match_id, champion_id, lane, result, team, kills, deaths, assists, vision_score, match_date } = request.body
    try {
        pool.query(`INSERT INTO match_histories 
                                (user_id, match_id, champion_id, lane, result, team, kills, deaths, assists, vision_score, match_date)
                    SELECT *
                    FROM (
                        VALUES                              
                                ($1::INTEGER, $2, $3::INTEGER, $4, $5::INTEGER, $6::INTEGER, $7::INTEGER, $8::INTEGER, $9::INTEGER, $10::INTEGER, to_timestamp($11::BIGINT / 1000))
                    )
                    AS  x (user_id, match_id, champion_id, lane, result, team, kills, deaths, assists, vision_score, match_date)
                        WHERE
                            exists (SELECT                  1
                                    FROM                    users
                                    WHERE                   users.id = x.user_id::INTEGER
                                    )
                        AND
                            not exists (SELECT              1
                                        FROM                match_histories
                                        WHERE               user_id = x.user_id::INTEGER
                                        AND                 match_id = x.match_id::VARCHAR
                                        )
                    RETURNING *`, 
            [user_id, match_id, champion_id, lane, result, team, kills, deaths, assists, vision_score, match_date], 
            (error, results) => {
                if (error) {
                    console.log('bad insert')
                    // console.log(error)
                    response.status(500).send(error)  
                }
                else {
                    console.log('good insert')
                    response.status(201).send(results.rows[0])
                }
            }
        )
    }
    catch (error) {
        response.status(500).send(error)
    }
}

const post_string = (request, response) => {
    const { match_string } = request.body
    try {
        pool.query(`INSERT INTO match_histories 
                            (user_id, match_id, champion_id, lane, result, team, kills, deaths, assists, vision_score, match_date)
                    SELECT *
                    FROM (
                    VALUES                              
                            ` + match_string + `
                    )
                    AS  x (user_id, match_id, champion_id, lane, result, team, kills, deaths, assists, vision_score, match_date)
                    WHERE
                        exists (SELECT                  1
                                FROM                    users
                                WHERE                   users.id = x.user_id::INTEGER
                                )
                    AND
                        not exists (SELECT              1
                                    FROM                match_histories
                                    WHERE               user_id = x.user_id::INTEGER
                                    AND                 match_id = x.match_id::VARCHAR
                                    )
                    RETURNING *`, 
            [], 
            (error, results) => {
                if (error) {
                    console.log('bad insert')
                    response.status(500).send(error)  
                }
                else {
                    console.log('good insert')
                    response.status(201).send(results.rows[0])
                }
            }
        )
    }
    catch (error) {
        response.status(500).send(error)
    }
}

module.exports = {
    get,
    getByID,
    getByUserID,
    post,
    post_string
}