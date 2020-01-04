const { pool } = require('../config')
const debug = require('debug');
const log = debug('xexpress:teams');

const axios = require('axios');

const getMatchList = (request, response) => {
    const id = parseInt(request.params.id)

    axios.get('http://localhost:3000/users/' + id)
    .then(res => {
        axios.get(
            'https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/' + res.data[0].account_id, 
            {
                headers: { 'X-Riot-Token': process.env.RIOT_API_KEY }
            }
        )
        .then(res_a => {
            var json_reverse = [];
            for(var i = res_a.data.matches.length - 1; i >= 0; i--){
                json_reverse.push(res_a.data.matches[i]);
            }

            response.status(200).json(json_reverse)
        })
        .catch(error => {
            response.status(500).json(error)
        });
    })
    .catch(error => {
        response.status(500).json(error)
    });
}

const postMatches = (request, response) => {
    const id = parseInt(request.params.id)
    
    var match_list = []

    axios.get('http://localhost:3000/match_list/' + id)
    .then(res => {
        match_num = res.data.length >= 10 ? 10 : res.data.length
        for (let x = 0; x < match_num; x++) {
            axios.get(
                'https://na1.api.riotgames.com/lol/match/v4/matches/' + res.data[x].gameId, 
                {
                    headers: { 'X-Riot-Token': process.env.RIOT_API_KEY }
                }
            )
            .then(res_a => {
                participant = findParticipant(res.data[x].champion, res_a.data.participants, match_list)
                .then(function (participant) {
                    if (participant) {
                        let match_values = '(' +
                                            id + ', ' +
                                            res.data[x].gameId + ', ' +
                                            participant.championId + ', ' +
                                            '\'' + res.data[x].lane + '\', ' +
                                            (participant.stats.win ? 1 : 0) + ', ' +
                                            participant.teamId + ', ' +
                                            participant.stats.kills + ', ' +
                                            participant.stats.deaths + ', ' +
                                            participant.stats.assists + ', ' +
                                            participant.stats.visionScore + ', ' +
                                            'to_timestamp(' + res.data[x].timestamp + ' / 1000)' +
                                            ')';
                        match_list.push(match_values)
                        if (match_list.length === match_num) {
                            match_string = match_list.length >= 1 ? match_list[0] : null
                            for (var y = 1; y < match_list.length; y++) {
                                match_string += ', ' + match_list[y]
                            }

                            axios.post('http://localhost:3000/match_histories_string', {
                                'match_string': match_string
                            })
                            .then(res => {
                                response.status(200).send('matchstringsent')
                            })
                            .catch(error => {
                            })
                        }
                    }
                })
                .catch(error => {
                    console.log("E1")
                })
            })
            .catch(error => {
            })
        }
    })
    .catch(error => {
        response.status(500).send("error")
    })

    response.status(200).json("match_histories")
}

async function findParticipant(champion_id, participants) {
    try {
        const participant = await new Promise(function (resolve, request) {
            participants.forEach(participant => {
                if (participant.championId === champion_id) {
                    resolve(participant);
                }
            });
        });
        return participant;
    }
    catch (e) {
        console.log("E2")
    }
}


function postMatchHistory(id, match_id, lane, match_date, participant) {
    axios.post('http://localhost:3000/match_histories', {
        'user_id': id,
        'match_id': match_id,
        'champion_id': participant.championId,
        'lane': lane,
        'result': participant.stats.win ? 1 : 0,
        'team': participant.teamId,
        'kills': participant.stats.kills,
        'deaths': participant.stats.deaths,
        'assists': participant.stats.assists,
        'vision_score': participant.stats.visionScore,
        'match_date': match_date
    })
    .then(res => {
    })
    .catch(error => {
    })
}

const getMastery = 0

module.exports = {
    getMatchList,
    postMatches,
    getMastery
}