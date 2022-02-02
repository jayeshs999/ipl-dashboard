import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { API } from 'src/app/API';
Chart.register(...registerables);
import { ScoreComparisonOptions } from './score-comparison.config';

@Component({
  selector: 'app-match-info',
  templateUrl: './match-info.component.html',
  styleUrls: ['./match-info.component.scss']
})
export class MatchInfoComponent implements OnInit, AfterViewInit {

  battingColumns: any[] = ['batter','runs','fours','sixes','balls_faced']
  bowlingColumns: any[] = ['bowler','balls_bowled','runs_given','wickets']
  chartOptions : any;
  matchID : any;
  @ViewChild('scoreComparisonChart',) scoreComparisonChart: ElementRef;
  @ViewChild('runsChart1',) runsChart1: ElementRef;
  @ViewChild('runsChart2',) runsChart2: ElementRef;
  scoreComparisonOptions : any;
  runChartOptions1 : any;
  runChartOptions2 : any;
  matchInfo : any;
  inningsInfo : any[]
  scoreComparison : any;
  matchSummary : any;
  summaryInfo : any;

  getSummaryInfo(){
    return this.inningsInfo.map((inn:any) =>{
      let info : any = {}
      info.team = inn.team;
      info.total_score = inn.batting.total_score;
      info.total_wickets = inn.batting.total_wickets;
      info.total_overs = inn.batting.total_overs;

      info.stats = [{},{},{}]

      for(let index = 0;index < inn.batting.best3.length;index++){
        let id = inn.batting.best3[index]
        let batter = inn.batting.stats.find((p:any)=>p.player_id==id);
        info.stats[index].batsman = batter.player_name;
        info.stats[index].batsman_id = batter.player_id;
        info.stats[index].batter_runs = batter.runs;
        info.stats[index].batter_balls = batter.balls_faced;
      }

      for(let index = 0;index < inn.bowling.best3.length;index++){
        let id = inn.bowling.best3[index]
        let bowler = inn.bowling.stats.find((p:any)=>p.player_id==id);
        info.stats[index].bowler = bowler.player_name;
        info.stats[index].bowler_id = bowler.player_id;
        info.stats[index].wickets = bowler.wickets;
        info.stats[index].bowler_runs = bowler.runs_given;
        info.stats[index].bowler_balls = bowler.balls_bowled;

      }

      return info;

    })

  }


  constructor(private http : HttpClient,
              private route : ActivatedRoute) { 
  }

  ngOnInit(): void {
    this.route.params.subscribe((params:any)=>{
      this.matchID = params.match_id;
      this.http.get(API.serverURL + API.getMatch + this.matchID).subscribe((data : any)=>{
        console.log(data);
        this.matchInfo = data.scorecard.match_info;
        this.inningsInfo = [data.scorecard.innings1,data.scorecard.innings2]
        this.summaryInfo = this.getSummaryInfo()
        console.log(this.summaryInfo);
        this.scoreComparison = data.score_comparison;
        this.matchSummary = data.match_summary;
        this.scoreComparisonOptions = ScoreComparisonOptions(this.scoreComparison.map((e:any) => parseInt(e.num_balls)),this.scoreComparison.map((e : any)=>e.runs),this.scoreComparison.map((e : any)=>e.wickets),this.inningsInfo.map((e : any)=>e.team))
      })
    })
  }

  ngAfterViewInit(){
    let ctx = this.scoreComparisonChart.nativeElement.getContext('2d');
    let chart = new Chart(ctx,this.scoreComparisonOptions);
    
    ctx = this.runsChart1.nativeElement.getContext('2d');
    chart = new Chart(ctx, {
      type: 'pie',
      data: {
          labels: ["Ones", "Twos", "Threes", "Fours", "Sixes", "Extras"],
          datasets: [{
              label: 'Innings 1',
              data: [1,1,1,1,1,1],
              backgroundColor: ["red","blue", "orange", "pink", "yellow", "black"],
              borderWidth: 1
          }]
      },
      options:{
        plugins:{
          title: {
            display: true,
            text : 'Team 1'
          }
        }
      }
    })

    ctx = this.runsChart2.nativeElement.getContext('2d');
    chart = new Chart(ctx, {
      type: 'pie',
      data: {
          labels: ["Ones", "Twos", "Threes", "Fours", "Sixes", "Extras"],
          datasets: [{
              label: 'Innings 2',
              data: [1,1,1,1,1,1],
              backgroundColor: ["red","blue", "orange", "pink", "yellow", "black"],
              borderWidth: 1
          }]
      },
      options:{
        plugins:{
          title: {
            display: true,
            text : 'Team 2'
          }
        }
      }
    })

  }

}
