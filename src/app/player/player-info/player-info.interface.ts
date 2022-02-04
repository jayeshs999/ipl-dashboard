export interface BasicInfo{
    name : string
    country : string;
    batting_skill : string;
    bowling_skill : string;
}

export interface BattingStats{
    matches : number;
    runs : number;
    fours : number;
    sixes : number;
    fifties : number;
    hs : number;
    strike_rate : number;
    average : number;
    match_ids : number[];
    match_runs : number[];
}

export interface BowlingStats {
    matches : number;
    runs : number;
    balls : number;
    overs : number;
    wickets : number;
    economy : number;
    five_wickets : number;
    match_ids : number[];
    match_runs : number[];
    match_wickets : number[];  
}

export interface PlayerInfo {
    basicInfo : BasicInfo;
    battingStats : BattingStats;
    bowlingStats : BowlingStats;
}