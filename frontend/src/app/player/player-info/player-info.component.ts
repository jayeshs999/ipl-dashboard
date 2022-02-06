import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { API } from 'src/app/API';
Chart.register(...registerables);
import { BattingsStatsConfig, COLORS, LEGEND_NAMES } from './batting-stats.config';
import { BowlingStatsConfig } from './bowling-stats.config';
import { PlayerInfo } from './player-info.interface';

@Component({
  selector: 'app-player-info',
  templateUrl: './player-info.component.html',
  styleUrls: ['./player-info.component.scss']
})
export class PlayerInfoComponent implements OnInit,AfterViewInit {
  battingLegendNames = LEGEND_NAMES;
  battingLegendColors =  COLORS;
  @ViewChild('battingStatsChart') battingStatsChart: ElementRef;
  @ViewChild('bowlingStatsChart') bowlingStatsChart: ElementRef;
  battingChartOptions : any;
  bowlingChartOptions : any;
  playerInfo : PlayerInfo;
  playerID : number;

  constructor(private http :HttpClient,
              private route : ActivatedRoute) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {

    this.route.params.subscribe((params:any)=>{
      this.playerID = params.player_id;
      this.http.get(API.serverURL + API.getPlayer + this.playerID).subscribe((data:any)=>{
        this.playerInfo = data;
        console.log(data);
        let ctx = this.battingStatsChart.nativeElement.getContext('2d');
        let chart = new Chart(ctx,BattingsStatsConfig(this.playerInfo.battingStats.match_ids,this.playerInfo.battingStats.match_runs));
        ctx = this.bowlingStatsChart.nativeElement.getContext('2d');
        chart = new Chart(ctx,BowlingStatsConfig(this.playerInfo.bowlingStats.match_ids,this.playerInfo.bowlingStats.match_runs,this.playerInfo.bowlingStats.match_wickets));
      })
    })

  }

}
