const { pool } = require('../config')
const debug = require('debug');
const log = debug('xexpress:teams');

const axios = require('axios');

const getBySummonerID = (request, response) => {
    const id = request.params.id
    axios.get(
        'https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/' + id, 
        {
            headers: { 'X-Riot-Token': process.env.RIOT_API_KEY }
        }
    )
    .then(res => {
        response.status(200).json(res.data)
    })
    .catch(error => {
        response.status(500).json(error)
    });
}

module.exports = {
    getBySummonerID
}