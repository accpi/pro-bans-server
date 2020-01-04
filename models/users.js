const { pool } = require('../config')
const debug = require('debug');
const log = debug('express:users');

const axios = require('axios');

const get = (request, response) => {
    try {
        pool.query(
            'SELECT * FROM users ORDER BY id ASC', 
            (error, results) => {
                if (error) {
                    console.log(error)
                    response.status(500).send(error)
                }
                else {
                    response.status(200).json(results.rows)
                }
            }
        )
    }
    catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
}

const getByID = (request, response) => {
    const id = parseInt(request.params.id)

    try {
        pool.query(
            'SELECT * FROM users where id = $1', 
            [id], 
            (error, results) => {
                if (error) {
                    console.log(error)
                    response.status(500).send(error)
                }
                else {
                    response.status(200).json(results.rows)
                }
            }
        )
    }
    catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
}

const getBySummonerID = (request, response) => {
    const id = request.params.id

    try {
        pool.query(
            'SELECT * FROM users where LOWER(summoner_name) = LOWER($1)', 
            [id], 
            (error, results) => {
                if (error) {
                    console.log(error)
                    response.status(500).send(error)
                }
                else {
                    response.status(200).json(results.rows)
                }
            }
        )
    }
    catch (error) {
        console.log(error)
        response.status(500).send(error)
    }
}

const post = (request, response) => {
    const { summoner_name, discord_name } = request.body

    axios.get(
        'https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + summoner_name, 
        {
            headers: { 'X-Riot-Token': process.env.RIOT_API_KEY }
        }
    )
    .then(res => {
        try {
            pool.query(
                'Insert INTO users (summoner_name, puuid, discord_name, account_id, summoner_id) VALUES ($1, $2, $3, $4, $5) returning *', 
                [summoner_name, res.data.puuid, discord_name, res.data.accountId, res.data.id], 
                (error, results) => {
                    if (error) {
                        console.log(error)
                        response.status(500).send(error)  
                    }
                    else {
                        response.status(201).send(results.rows[0])
                    }
                }
            )
        }
        catch (error) {
            console.log(error)
            response.status(500).send(error)
        }
    })
    .catch(error => {
        console.log(error)
        response.status(500).json(error)
    });
}

const update = (request, response) => {
    const id = parseInt(request.params.id)

    axios.get('http://localhost:3000/users/' + id)
    .then(res => {
        axios.get(
            'https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + res.data[0].summoner_name, 
            {
                headers: { 'X-Riot-Token': process.env.RIOT_API_KEY }
            }
        )
        .then(res_a => {
            try {
                pool.query(
                    'UPDATE users SET puuid = $1, account_id = $2, summoner_id = $3 where id = $4 returning *', 
                    [res_a.data.puuid, res_a.data.accountId, res_a.data.id, id], 
                    (error, results) => {
                        if (error) {
                            console.log(error)
                            response.status(500).send(error)
                        }
                        else {
                            response.status(201).send(results.rows[0])
                        }
                    }
                )
            }
            catch (error) {
                console.log(error)
                response.status(500).send(error)
            }
        })
        .catch(error => {
            console.log(error)
            response.status(500).json(error)
        });
    })
    .catch(error => {
        console.log(error)
        response.status(500).json(error)
    });

}

module.exports = {
    get,
    getByID,
    getBySummonerID,
    post,
    update
}