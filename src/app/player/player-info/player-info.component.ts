import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { BattingsStatsConfig, COLORS, LEGEND_NAMES } from './batting-stats.config';
import { BowlingStatsConfig } from './bowling-stats.config';

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
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.battingChartOptions = BattingsStatsConfig([1,2,3,4,5,6,7],[18,30,31,40,50,51,20]);
    let ctx = this.battingStatsChart.nativeElement.getContext('2d');
    let chart = new Chart(ctx,this.battingChartOptions);
    this.bowlingChartOptions = BowlingStatsConfig([1,2,3,4,5,6,7],[20,12,14,13,12,1,17],[2,4,3,5,6,0,1])
    ctx = this.bowlingStatsChart.nativeElement.getContext('2d');
    chart = new Chart(ctx,this.bowlingChartOptions);
  }

}
