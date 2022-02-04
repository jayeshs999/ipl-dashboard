export interface BasicInfo{
    venue_name : string;
    address : string;
    capacity : number;
    total_matches : number;
    highest_total : number;
    lowest_total : number;
    highest_score_chased : number;
}

export interface MatchOutline{
    won_first : number;
    won_second : number;
    draw : number;
}

export interface ScoreOutline {
    season_year : number[];
    avg_first_score : number[]; 
}

export interface VenueInfo {
    basicInfo : BasicInfo;
    matchOutline : MatchOutline;
    scoreOutline : ScoreOutline;
}