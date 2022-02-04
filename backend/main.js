const {Client, Pool} = require('pg');
const Cursor = require('pg-cursor');
const express = require('express');
const cors = require('cors');
const { request, response } = require('express');
var app = express()
app.use(cors())

function execute_query(query) {
    return new Promise(function (resolve, reject) {
        pool.query(query, (error, results) => {
            if (error){
                throw error;
            }
            resolve(results.rows)
        })
    })
}

async function execute_retlist(query, name){
    res = await execute_query(query)
    ret = []
    for (const x in res){
        ret.push(res[x][name])
    }
    return ret
}

async function match_id(id) {
    var result = {}
    result.scorecard = {}

    const query1 = {
        text: "select match_id, team_1.team_name as team1, team_2.team_name as team2, venue.venue_name, match.season_year as year, toss_winner.team_name as toss from match, team as team_1, team as team_2, venue, team as toss_winner where match.team1 = team_1.team_id  and match.team2 = team_2.team_id and match.venue_id = venue.venue_id and match.toss_winner = toss_winner.team_id and match.match_id=$1;",
        values: [id]
    }
    const query2 = {
        text: "select umpire_name from umpire_match, umpire where match_id = $1 and umpire_match.umpire_id = umpire.umpire_id;",
        values: [id]
    }
    const query3 = {
        text: "select player_name from player_match, player where match_id = $1 and team_id = (select team1 from match where match_id = $1) and player_match.player_id = player.player_id; ",
        values: [id]
    }
    const query4 = {
        text: "select player_name from player_match, player where match_id = $1 and team_id = (select team2 from match where match_id = $1) and player_match.player_id = player.player_id; ",
        values: [id]
    }
    
    result.scorecard.match_info = {}
    result.scorecard.match_info = (await execute_query(query1))[0]
    result.scorecard.match_info.umpires = await execute_retlist(query2, "umpire_name")
    result.scorecard.match_info.playing1 = await execute_retlist(query3, "player_name")
    result.scorecard.match_info.playing2 = await execute_retlist(query4, "player_name")
    const query5 = {
        text: "select team1, team2, toss_winner, toss_name from match where match_id = $1",
        values: [id]
    }


    var temp = (await execute_query(query5))[0]
    var innings1, innings2
    // console.log(temp)
    if (temp.toss_name == 'bat'){
        innings1 = temp.toss_winner
        if (temp.team1 == temp.toss_winner) {
            innings2 = temp.team2
        }
        else{
            innings2 = temp.team1
        }
    }
    else{
        if (temp.team1 == temp.toss_winner){
            innings1 = temp.team2
            innings2 = temp.team1
        }
        else{
            innings1 = temp.team1
            innings2 = temp.team2
        }
    }
    // console.log(innings1, innings2)

    const query6 = {
        text: "select team_name from team where team_id = $1",
        values: [innings1]
    }
    result.scorecard.innings1 = {}
    result.scorecard.innings1.team = (await execute_query(query6))[0].team_name
    
    const query7 = {
        text: "select sum(extra_runs) as extra_runs, sum(extra_runs) + sum(runs_scored) as total_score, count(out_type) filter (where out_type is not null) as total_wickets, max(over_id) as total_overs from ball_by_ball where match_id = $1 and innings_no = 1;",
        values: [id]
    }
    
    result.scorecard.innings1.batting = (await execute_query(query7))[0]

    const query8 = {
        text: "select player_match.player_id, player.player_name, coalesce (sum(runs_scored),0) as runs, count(*) filter (where runs_scored = 4) as fours, count(*) filter (where runs_scored = 6) as sixes, count(*) filter (where over_id is not null) as balls_faced from player_match left join ball_by_ball on player_match.match_id = ball_by_ball.match_id and player_match.player_id = ball_by_ball.striker, player where player_match.match_id = $1 and team_id = $2 and player_match.player_id = player.player_id group by player_match.player_id, player.player_name;",
        values: [id, innings1]
    }
    result.scorecard.innings1.batting.stats = await execute_query(query8)

    const query9 = {
        text: "select striker, player_name, sum(runs_scored) as runs, count(*) as balls_faced from ball_by_ball, player where match_id = $1 and innings_no = 1 and ball_by_ball.striker = player.player_id group by striker, player_name order by runs desc, balls_faced asc, player_name asc limit 3;",
        values: [id]
    }
    result.scorecard.innings1.batting.best3 = await execute_retlist(query9, 'striker')

    const query10 = {
        text: "select coalesce (sum(runs_scored) filter (where runs_scored = 0), 0) as zeros, coalesce (sum(runs_scored) filter (where runs_scored = 1), 0) as ones, coalesce (sum(runs_scored) filter (where runs_scored = 2), 0) as twos, coalesce (sum(runs_scored) filter (where runs_scored = 3), 0) as threes, coalesce (sum(runs_scored) filter (where runs_scored = 4), 0) as fours, coalesce (sum(runs_scored) filter (where runs_scored = 5), 0) as fives, coalesce (sum(runs_scored) filter (where runs_scored = 6), 0) as sixes from ball_by_ball where match_id = $1 and innings_no = 1;",
        values: [id]
    }
    result.scorecard.innings1.batting.totals = (await execute_query(query10))[0]

    result.scorecard.innings1.bowling = {}

    const query11 = {
        text: "select player_match.player_id, player.player_name, coalesce (sum(runs_scored),0) as runs_given, count(*) filter (where out_type is not null) as wickets, count(*) as balls_bowled  from player_match inner join ball_by_ball on player_match.match_id = ball_by_ball.match_id and player_match.player_id = ball_by_ball.bowler, player  where player_match.match_id = $1 and team_id = $2 and player_match.player_id = player.player_id  group by player_match.player_id, player.player_name; ",
        values: [id, innings2]
    }
    result.scorecard.innings1.bowling.stats = await execute_query(query11)

    const query12 = {
        text: "select bowler, player_name, count(*) filter (where out_type is not null) as wickets, sum(runs_scored) as runs_given from ball_by_ball, player  where match_id = $1 and innings_no = 1 and ball_by_ball.bowler = player.player_id  group by bowler, player_name  having count(*) filter (where out_type is not null) > 0 order by wickets desc, runs_given asc, player_name asc limit 3;",
        values: [id]
    }
    result.scorecard.innings1.bowling.best3 = await execute_retlist(query12, 'bowler')




    const query13 = {
        text: "select team_name from team where team_id = $1",
        values: [innings2]
    }
    result.scorecard.innings2 = {}
    result.scorecard.innings2.team = (await execute_query(query13))[0].team_name
    
    const query14 = {
        text: "select sum(extra_runs) as extra_runs, sum(extra_runs) + sum(runs_scored) as total_score, count(out_type) filter (where out_type is not null) as total_wickets, max(over_id) as total_overs from ball_by_ball where match_id = $1 and innings_no = 2;",
        values: [id]
    }
    
    result.scorecard.innings2.batting = (await execute_query(query14))[0]

    const query15 = {
        text: "select player_match.player_id, player.player_name, coalesce (sum(runs_scored),0) as runs, count(*) filter (where runs_scored = 4) as fours, count(*) filter (where runs_scored = 6) as sixes, count(*) filter (where over_id is not null) as balls_faced from player_match left join ball_by_ball on player_match.match_id = ball_by_ball.match_id and player_match.player_id = ball_by_ball.striker, player where player_match.match_id = $1 and team_id = $2 and player_match.player_id = player.player_id group by player_match.player_id, player.player_name;",
        values: [id, innings2]
    }
    result.scorecard.innings2.batting.stats = await execute_query(query15)

    const query16 = {
        text: "select striker, player_name, sum(runs_scored) as runs, count(*) as balls_faced from ball_by_ball, player where match_id = $1 and innings_no = 2 and ball_by_ball.striker = player.player_id group by striker, player_name order by runs desc, balls_faced asc, player_name asc limit 3;",
        values: [id]
    }
    result.scorecard.innings2.batting.best3 = await execute_retlist(query16, 'striker')

    const query17 = {
        text: "select coalesce (sum(runs_scored) filter (where runs_scored = 0), 0) as zeros, coalesce (sum(runs_scored) filter (where runs_scored = 1), 0) as ones, coalesce (sum(runs_scored) filter (where runs_scored = 2), 0) as twos, coalesce (sum(runs_scored) filter (where runs_scored = 3), 0) as threes, coalesce (sum(runs_scored) filter (where runs_scored = 4), 0) as fours, coalesce (sum(runs_scored) filter (where runs_scored = 5), 0) as fives, coalesce (sum(runs_scored) filter (where runs_scored = 6), 0) as sixes from ball_by_ball where match_id = $1 and innings_no = 2;",
        values: [id]
    }
    result.scorecard.innings2.batting.totals = (await execute_query(query17))[0]

    result.scorecard.innings2.bowling = {}

    const query18 = {
        text: "select player_match.player_id, player.player_name, coalesce (sum(runs_scored),0) as runs_given, count(*) filter (where out_type is not null) as wickets, count(*) as balls_bowled  from player_match inner join ball_by_ball on player_match.match_id = ball_by_ball.match_id and player_match.player_id = ball_by_ball.bowler, player  where player_match.match_id = $1 and team_id = $2 and player_match.player_id = player.player_id  group by player_match.player_id, player.player_name; ",
        values: [id, innings1]
    }
    result.scorecard.innings2.bowling.stats = await execute_query(query18)

    const query19 = {
        text: "select bowler, player_name, count(*) filter (where out_type is not null) as wickets, sum(runs_scored) as runs_given from ball_by_ball, player  where match_id = $1 and innings_no = 2 and ball_by_ball.bowler = player.player_id  group by bowler, player_name  having count(*) filter (where out_type is not null) > 0 order by wickets desc, runs_given asc, player_name asc limit 3;",
        values: [id]
    }
    result.scorecard.innings2.bowling.best3 = await execute_retlist(query19, 'bowler')

    const query20 = {
        text: "select match_id, season_year, team.team_name as toss from match, team where match.toss_winner = team.team_id and match_id = $1",
        values: [id]
    }
    result.match_summary = await execute_query(query20)
    
    result.score_comparison = []
    result.score_comparison[0] = {}

    const query21 = {
        text: "select count(*) from ball_by_ball where match_id = $1 and innings_no = 1;",
        values: [id]
    }
    result.score_comparison[0].num_balls = (await execute_query(query21))[0].count

    result.score_comparison[0].runs = [0]
    const query22 = {
        text: "select runs_scored+extra_runs as runs_scored from ball_by_ball where match_id = $1 and innings_no = 1;",
        values: [id]
    }
    result.score_comparison[0].runs = result.score_comparison[0].runs.concat(await execute_retlist(query22, 'runs_scored'))
    for (let i=1; i<result.score_comparison[0].runs.length; i++) {
        result.score_comparison[0].runs[i] = result.score_comparison[0].runs[i] + result.score_comparison[0].runs[i-1]
    }

    const query23 = {
        text: "select over_id, ball_id from ball_by_ball where match_id = $1 and innings_no = 1 and out_type is not null;",
        values: [id]
    }
    temp = await execute_query(query23)
    result.score_comparison[0].wickets = []
    for (let x in temp){
        result.score_comparison[0].wickets.push((temp[x]['over_id']-1)*6 + (temp[x]['ball_id']-1))
    }

    result.score_comparison[1] = {}

    const query24 = {
        text: "select count(*) from ball_by_ball where match_id = $1 and innings_no = 2;",
        values: [id]
    }
    result.score_comparison[1].num_balls = (await execute_query(query24))[0].count

    result.score_comparison[1].runs = [0]
    const query25 = {
        text: "select runs_scored+extra_runs as runs_scored from ball_by_ball where match_id = $1 and innings_no = 2;",
        values: [id]
    }
    result.score_comparison[1].runs = result.score_comparison[1].runs.concat(await execute_retlist(query25, 'runs_scored'))
    for (let i=1; i<result.score_comparison[1].runs.length; i++) {
        result.score_comparison[1].runs[i] = result.score_comparison[1].runs[i] + result.score_comparison[1].runs[i-1]
    }

    const query26 = {
        text: "select over_id, ball_id from ball_by_ball where match_id = $1 and innings_no = 2 and out_type is not null;",
        values: [id]
    }
    temp = await execute_query(query26)
    result.score_comparison[1].wickets = []
    for (let x in temp){
        result.score_comparison[1].wickets.push((temp[x]['over_id']-1)*6 + (temp[x]['ball_id']-1))
    }
    return result
}

const pool = new Pool()
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})

app.get('/matches', function(request, res) {
    const query = "select match.match_id as id, team_1.team_name as team1, team_2.team_name as team2, venue.venue_name, venue.city_name as venue_city, winner.team_name as winner, match.win_type as win_type, match.win_margin as win_margin from match, venue, team as team_1, team as team_2, team as winner where match.venue_id = venue.venue_id and match.team1 = team_1.team_id and match.team2 = team_2.team_id and match.match_winner = winner.team_id;"
    // console.log(req.query.start)
    const start = request.query.start
    const num = request.query.num

    pool.query(query, (error, results) => {
        if (error){
            throw error
        }
        var response = {}
        response.num_entries = num
        response.matches = []
        for (let i=start; i<start+num;i++){
            response.matches[i] = results.rows[i]
        }
        res.json(response)

    })
});

app.get('/matches/:id', async(request, response) => {
    const id = request.params.id;
    match_id(id).then((res)=>{
        response.json(res);
        response.end();
    })
})



var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})
