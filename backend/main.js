const { Pool} = require('pg');
const express = require('express');
const cors = require('cors');
var bodyParser = require('body-parser');
var app = express()
app.use(cors())
app.use(bodyParser.json());

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

async function matches(start, num){
    var result = {}
    result.matches = []
    const query = {
        text: "select match.match_id as id, team_1.team_name as team1, team_2.team_name as team2, venue.venue_name, venue.city_name as venue_city, winner.team_name as winner, match.win_type as win_type, match.win_margin as win_margin from match, venue, team as team_1, team as team_2, team as winner where match.venue_id = venue.venue_id and match.team1 = team_1.team_id and match.team2 = team_2.team_id and match.match_winner = winner.team_id;",
        values: []
    }
    temp = await execute_query(query)
    // console.log(temp.length)
    result.num_entries = temp.length
    // console.log(start + num)
    for (let i=start; i<start+num; i++){
        // console.log(i)
        if (i >= temp.length) break
        result.matches.push(temp[i])
    }
    return result
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

    const query4_1 = {
        text: "select team_name, win_type, win_margin from match, team  where match_id = $1 and match.match_winner = team.team_id;",
        values: [id]
    }
    temp = (await execute_query(query4_1))[0]
    // console.log(temp)
    result.scorecard.match_info.winner = temp.team_name
    result.scorecard.match_info.win_type = temp.win_type
    result.scorecard.match_info.win_margin = temp.win_margin
    
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
        text: "select player_match.player_id, player.player_name, coalesce (sum(runs_scored),0) as runs, count(*) filter (where runs_scored = 4) as fours, count(*) filter (where runs_scored = 6) as sixes, count(*) filter (where over_id is not null) as balls_faced, min((over_id-1)*6 + ball_id) as pos from player_match inner join ball_by_ball on player_match.match_id = ball_by_ball.match_id and player_match.player_id = ball_by_ball.striker, player where player_match.match_id = $1 and team_id = $2 and player_match.player_id = player.player_id group by player_match.player_id, player.player_name order by pos;",
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
    result.scorecard.innings1.batting.totals.extra_runs = result.scorecard.innings1.batting.extra_runs
    result.scorecard.innings1.bowling = {}

    const query11 = {
        text: "select player_match.player_id, player.player_name, coalesce (sum(runs_scored),0) as runs_given, count(*) filter (where out_type is not null and out_type not in ('run out', 'retired hurt')) as wickets, count(*) as balls_bowled, count(distinct over_id) as overs_bowled  from player_match inner join ball_by_ball on player_match.match_id = ball_by_ball.match_id and player_match.player_id = ball_by_ball.bowler, player  where player_match.match_id = $1 and team_id = $2 and player_match.player_id = player.player_id  group by player_match.player_id, player.player_name; ",
        values: [id, innings2]
    }
    result.scorecard.innings1.bowling.stats = await execute_query(query11)

    const query12 = {
        text: "select bowler, player_name, count(*) filter (where out_type is not null and out_type not in ('run out', 'retired hurt')) as wickets, sum(runs_scored) as runs_given from ball_by_ball, player  where match_id = $1 and innings_no = 1 and ball_by_ball.bowler = player.player_id  group by bowler, player_name  having count(*) filter (where out_type is not null and out_type not in ('retired hurt', 'run out')) > 0 order by wickets desc, runs_given asc, player_name asc limit 3;",
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
        text: "select player_match.player_id, player.player_name, coalesce (sum(runs_scored),0) as runs, count(*) filter (where runs_scored = 4) as fours, count(*) filter (where runs_scored = 6) as sixes, count(*) filter (where over_id is not null) as balls_faced, min((over_id-1)*6 + ball_id) as pos from player_match inner join ball_by_ball on player_match.match_id = ball_by_ball.match_id and player_match.player_id = ball_by_ball.striker, player where player_match.match_id = $1 and team_id = $2 and player_match.player_id = player.player_id group by player_match.player_id, player.player_name order by pos;",
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
    result.scorecard.innings2.batting.totals.extra_runs = result.scorecard.innings2.batting.extra_runs
    
    result.scorecard.innings2.bowling = {}

    const query18 = {
        text: "select player_match.player_id, player.player_name, coalesce (sum(runs_scored),0) as runs_given, count(*) filter (where out_type is not null and out_type not in ('run out', 'retired hurt')) as wickets, count(*) as balls_bowled, count(distinct over_id) as overs_bowled  from player_match inner join ball_by_ball on player_match.match_id = ball_by_ball.match_id and player_match.player_id = ball_by_ball.bowler, player  where player_match.match_id = $1 and team_id = $2 and player_match.player_id = player.player_id  group by player_match.player_id, player.player_name; ",
        values: [id, innings1]
    }
    result.scorecard.innings2.bowling.stats = await execute_query(query18)

    const query19 = {
        text: "select bowler, player_name, count(*) filter (where out_type is not null and out_type not in ('run out', 'retired hurt')) as wickets, sum(runs_scored) as runs_given from ball_by_ball, player  where match_id = $1 and innings_no = 2 and ball_by_ball.bowler = player.player_id  group by bowler, player_name  having count(*) filter (where out_type is not null and out_type not in ('retired hurt', 'run out')) > 0 order by wickets desc, runs_given asc, player_name asc limit 3;",
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
        text: "select sum(runs_scored)+sum(extra_runs) as runs_scored from ball_by_ball where match_id = $1 and innings_no = 1 group by over_id order by over_id;",
        values: [id]
    }
    result.score_comparison[0].runs = result.score_comparison[0].runs.concat(await execute_retlist(query22, 'runs_scored'))
    for (let i=1; i<result.score_comparison[0].runs.length; i++) {
        result.score_comparison[0].runs[i] = Number(result.score_comparison[0].runs[i]) + result.score_comparison[0].runs[i-1]
    }

    const query23 = {
        text: "select over_id, ball_id from ball_by_ball where match_id = $1 and innings_no = 1 and out_type is not null;",
        values: [id]
    }
    temp = await execute_query(query23)
    result.score_comparison[0].wickets = []
    for (let x in temp){
        result.score_comparison[0].wickets.push(temp[x]['over_id'])
    }

    result.score_comparison[1] = {}

    const query24 = {
        text: "select count(*) from ball_by_ball where match_id = $1 and innings_no = 2;",
        values: [id]
    }
    result.score_comparison[1].num_balls = (await execute_query(query24))[0].count

    result.score_comparison[1].runs = [0]
    const query25 = {
        text: "select sum(runs_scored)+sum(extra_runs) as runs_scored from ball_by_ball where match_id = $1 and innings_no = 2 group by over_id order by over_id;",
        values: [id]
    }
    result.score_comparison[1].runs = result.score_comparison[1].runs.concat(await execute_retlist(query25, 'runs_scored'))
    for (let i=1; i<result.score_comparison[1].runs.length; i++) {
        result.score_comparison[1].runs[i] = Number(result.score_comparison[1].runs[i]) + result.score_comparison[1].runs[i-1]
    }

    const query26 = {
        text: "select over_id, ball_id from ball_by_ball where match_id = $1 and innings_no = 2 and out_type is not null;",
        values: [id]
    }
    temp = await execute_query(query26)
    result.score_comparison[1].wickets = []
    for (let x in temp){
        result.score_comparison[1].wickets.push(temp[x]['over_id']-1)
    }
    return result
}

async function player_id(id) {
    var result = {}

    const query1 = {
        text: "select player_name as name, country_name as country, batting_hand as batting_skill, bowling_skill from player where player_id = $1;",
        values: [id]
    }
    result.basicInfo = (await execute_query(query1))[0]


    const query2 = {
        text: "select coalesce(sum(runs_scored),0) as runs, sum(runs_scored) filter (where runs_scored = 4) as fours, sum(runs_scored) filter (where runs_scored = 6) as sixes, coalesce (count(*), 0) as strike_rate from ball_by_ball where ball_by_ball.striker = $1;",
        values: [id]
    }
    result.battingStats = (await execute_query(query2))[0]
    if (result.battingStats.strike_rate != 0)
        result.battingStats.strike_rate = (Number(result.battingStats.runs) / Number(result.battingStats.strike_rate))*100 

    const query3 = {
        text: "select count(distinct(match_id)) from ball_by_ball where striker = $1 or non_striker = $1;",
        values: [id]
    }
    result.battingStats.matches = (await execute_query(query3))[0].count

    const query4 = {
        text: "select match_id, sum(runs_scored), count(*) filter (where out_type is not null) as outs from ball_by_ball where striker = $1 group by match_id order by match_id;",
        values: [id]
    }
    var temp = await execute_query(query4)
    result.battingStats.match_ids = await execute_retlist(query4, 'match_id')
    result.battingStats.match_runs = await execute_retlist(query4, 'sum')
    // console.log(temp)
    var sum = 0
    var hs = 0
    var fifty = 0
    var outs = 0
    for (let i=0; i<temp.length; i++){
        sum += Number(temp[i].sum)
        hs = Math.max(hs, temp[i].sum)
        if (temp[i].sum >= 50){
            fifty += 1
        }
        outs += Number(temp[i].outs)
    }
    if (temp.length == 0)
        result.battingStats.average = 0
    else if (outs == 0)
        result.battingStats.average = sum
    else
        result.battingStats.average = sum/outs
    result.battingStats.hs = hs
    result.battingStats.fifties = fifty


    const query5 = {
        text: "select coalesce(sum(runs_scored),0) as runs, count(*) as balls, count(distinct (over_id, match_id)) as overs, count (*) filter (where out_type is not null and out_type not in ('retired hurt', 'run out')) as wickets from ball_by_ball where bowler = $1;",
        values: [id]
    }
    result.bowlingStats = (await execute_query(query5))[0];

    if (result.bowlingStats.balls != 0)
        result.bowlingStats.economy = result.bowlingStats.runs/result.bowlingStats.overs


    const query6 = {
        text: "select count(distinct match_id) from ball_by_ball where bowler=$1;",
        values: [id]
    }
    result.bowlingStats.matches = (await execute_query(query6))[0].count

    const query7 = {
        text: "select match_id, sum(runs_scored) as runs, count (*) filter (where out_type is not null and out_type not in ('retired hurt', 'run out')) as wickets from ball_by_ball where bowler = $1 group by match_id order by match_id;",
        values: [id]
    }

    var temp = await execute_query(query7)
    result.bowlingStats.match_ids = await execute_retlist(query7, 'match_id')
    result.bowlingStats.match_runs = await execute_retlist(query7, 'runs')
    result.bowlingStats.match_wickets = await execute_retlist(query7, 'wickets')

    var num_five = 0
    for (let i=0;i<temp.length;i++){
        if (temp[i].wickets >= 5) num_five += 1
    }
    result.bowlingStats.five_wickets = num_five
    return result
}

async function points_table(year) {
    var result = []
    // const query1 = {
    //     text: "select * from match where season_year = $1",
    //     values: [year]
    // }
    // temp = await execute_query(query1)
    // console.log(temp)
    const query2 = {
        text: "select distinct team1 as team from match where season_year = $1 union select distinct team2 as team from match where season_year = $1 order by team;",
        values: [year]
    }
    teams = await execute_query(query2)
    for (let i=0;i<teams.length;i++){
        var team_id = teams[i].team
        var query3 = {
            text: "select team_name from team where team_id = $1",
            values: [team_id]
        }
        var query4 = {
            text: "select count(*) as num_matches, count(*) filter (where match_winner = $1) as won, count(*) filter (where match_winner != $1) as lost, count(*) filter (where match_winner != team1 and match_winner != team2) as tied from match, team where (team1 = $1 or team2 = $1) and team.team_id = $1 and season_year = $2;",
            values: [team_id, year]
        }

        var dict = {}
        dict = (await execute_query(query4))[0]
        dict.team_name = (await execute_query(query3))[0].team_name
        dict.points = 2*Number(dict.won)
        
        var runs_scored=0
        var over_faced=0
        var runs_conceded=0
        var over_bowled=0

        var query5 = {
            text: "select match_id, team1, team2, toss_winner, toss_name from match where (team1 = $1 or team2 = $1) and season_year = $2;",
            values: [team_id, year]
        }
        var temp = await execute_query(query5)
        
        for (let i=0;i<temp.length;i++){
            var match_id = Number(temp[i].match_id)
            var innings
            if (temp[i].toss_name == 'bat'){
                if (team_id == temp[i].toss_winner){
                    innings = 1
                }
                else{
                    innings = 2
                }
            }
            else{
                if (team_id == temp[i].toss_winner){
                    innings = 2
                }
                else{
                    innings = 1
                }
            }
            var query6 = {
                text: "select sum(runs_scored)+sum(extra_runs) as runs_scored, max(over_id) as overs_faced from ball_by_ball where match_id = $1 and innings_no = $2;",
                values: [match_id, innings]
            }
            var temp2 = (await execute_query(query6))[0]
            // console.log(temp2)
            runs_scored += Number(temp2.runs_scored)
            over_faced += Number(temp2.overs_faced)
            var query7 = {
                text: "select sum(runs_scored)+sum(extra_runs) as runs_scored, max(over_id) as overs_faced from ball_by_ball where match_id = $1 and innings_no = $2;",
                values: [match_id, 3 - innings]
            }
            temp2 = (await execute_query(query7))[0]
            runs_conceded += Number(temp2.runs_scored)
            over_bowled += Number(temp2.overs_faced)
        }
        // console.log(runs_scored, runs_conceded, over_bowled, over_faced)
        dict.nr = runs_scored/over_faced - runs_conceded/over_bowled
        result.push(dict)
    }

    result.sort(function(a, b) {
        if (a.points < b.points) return 1
        if (a.points > b.points) return -1
        if (a.points == b.points) {
            if (a.nr < b.nr) return 1
            else return -1
        }
    })
    return result
}

async function venues() {
    var result = []
    const query = {
        text: "select venue.venue_id, venue_name, city_name as address, capacity, (select count(*) from match where venue.venue_id = match.venue_id) as total_matches from venue;",
        values: []
    }
    result = await execute_query(query)
    return result
}

async function venue(id) {
    var result = {}
    const query1 = {
        text: "select venue_name, city_name as address, capacity, count(*) filter (where match_id is not null) as total_matches from match right join venue on match.venue_id = venue.venue_id where venue.venue_id = $1 group by venue_name, city_name, capacity;",
        values: [id]
    }
    result.basicInfo = (await execute_query(query1))[0]
    // console.log(result)

    const query2_1 = {
        text: "with info as ( select ball_by_ball.match_id, innings_no, sum(runs_scored) + sum(extra_runs) as runs, match.venue_id, match.season_year from ball_by_ball, match where ball_by_ball.match_id = match.match_id group by ball_by_ball.match_id, innings_no,  match.venue_id, match.season_year)  select max(runs), min(runs) from info where venue_id = $1;",
        values: [id]
    }
    var temp = (await execute_query(query2_1))[0]
    if (temp.max == null){
        result.basicInfo.highest_total = 0
        result.basicInfo.lowest_total = 0
    }
    else {
        result.basicInfo.highest_total = temp.max
        result.basicInfo.lowest_total = temp.min
    }
    
    // console.log(temp)

    const query2 = {
        text: "with info as ( select ball_by_ball.match_id, innings_no, sum(runs_scored) + sum(extra_runs) as runs, match.venue_id from ball_by_ball, match where ball_by_ball.match_id = match.match_id group by ball_by_ball.match_id, innings_no,  match.venue_id ), inf as ( select I1.match_id, I1.innings_no as innings1, I1.runs as runs1, I2.innings_no as innings2, I2.runs as runs2, I1.venue_id from info as I1, info as I2 where I1.match_id = I2.match_id and I1.innings_no = 1 and I2.innings_no = 2 ) select coalesce(max(runs1), 0) as maxm from inf  where runs2 > runs1  and venue_id = $1;",
        values: [id]
    }
    
    result.basicInfo.highest_score_chased = (await execute_query(query2))[0].maxm

    const query3 = {
        text: "with info as ( select ball_by_ball.match_id, innings_no, sum(runs_scored) + sum(extra_runs) as runs, match.venue_id from ball_by_ball, match where ball_by_ball.match_id = match.match_id group by ball_by_ball.match_id, innings_no,  match.venue_id ), inf as ( select I1.match_id, I1.innings_no as innings1, I1.runs as runs1, I2.innings_no as innings2, I2.runs as runs2, I1.venue_id from info as I1, info as I2 where I1.match_id = I2.match_id and I1.innings_no = 1 and I2.innings_no = 2 ) select count(*) filter (where runs1 > runs2) as won_first, count(*) filter (where runs2 > runs1) as won_second, 0 as draw from inf where venue_id = $1;",
        values: [id]
    }
    result.matchOutline = (await execute_query(query3))[0]
    const query4 = {
        text: "with info as ( select ball_by_ball.match_id, innings_no, sum(runs_scored) + sum(extra_runs) as runs, match.venue_id, match.season_year from ball_by_ball, match where ball_by_ball.match_id = match.match_id group by ball_by_ball.match_id, innings_no,  match.venue_id, match.season_year ), inf as ( select I1.match_id, I1.innings_no as innings1, I1.runs as runs1, I2.innings_no as innings2, I2.runs as runs2, I1.venue_id, I1.season_year from info as I1, info as I2 where I1.match_id = I2.match_id and I1.innings_no = 1 and I2.innings_no = 2 ) select season_year, avg(runs1) from inf where venue_id = $1 group by season_year;",
        values: [id]
    }
    result.scoreOutline = {}
    result.scoreOutline.season_year = await execute_retlist(query4, 'season_year')
    result.scoreOutline.avg_first_score = await execute_retlist(query4, 'avg')
    
    return result
}

const pool = new Pool()
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err)
    process.exit(-1)
})


app.get('/matches', async(request, response) => {
    // console.log(request.query.start)
    const start = Number(request.query.start)
    const num = Number(request.query.num)
    // console.log(start,num)
    matches(start, num).then((res) => {
        response.json(res)
        response.end()
    })
})

app.get('/matches/:id', async(request, response) => {
    const id = request.params.id;
    match_id(id).then((res)=>{
        response.json(res);
        response.end();
    })
})

app.get('/players/',async(request, response) => {

    const start = Number(request.query.start) || 0
    const num = Number(request.query.num) || 10
    
    let query = {
        text : 'SELECT * FROM player LIMIT $2 OFFSET $1',
        values : [start,num]
    }
    data = await execute_query(query);

    let num_query = {
        text : 'SELECT COUNT(*) count FROM player',
        values : []
    }
    
    nump = await execute_query(num_query);
    
    response.json({num_players : nump[0].count,data: data});
    response.end()

})

app.get('/players/:id', async(request, response) => {
    const id = request.params.id;
    player_id(id).then((res) => {
        response.json(res);
        response.end();
    })
})

app.get('/pointstable/',async(request, response) => {

    let query = {
        text : 'SELECT DISTINCT(season_year) FROM match',
        values : []
    }
    
    execute_retlist(query,'season_year').then((val)=>{
        response.json(val);
        response.end()
    }) 

})

app.get('/pointstable/:year', async(request, response) => {
    const year = request.params.year;
    points_table(year).then((res) => {
        response.json(res);
        response.end();
    })
})

app.get('/venues', async(request, response) => {
    venues().then((res) => {
        response.json(res)
        response.end()
    })
})

app.get('/venue/:id', async(request, response) => {
    const id = request.params.id
    venue(id).then((res) => {
        response.json(res)
        response.end()
    })

})

app.post('/venues/add/',async(request, response) => {

    let query = {
        text : 'INSERT INTO venue(venue_name,country_name,city_name,capacity) VALUES ($1,$2,$3,$4)',
        values : [request.body.name,request.body.country,request.body.city,request.body.capacity]
    }

    console.log(query);
    
    execute_query(query).then((val)=>{
        response.json({message : 'New venue added'})
        response.end()
    }) 

})

var server = app.listen(8081, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port)
})
