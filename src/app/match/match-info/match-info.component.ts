import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';

@Component({
  selector: 'app-match-info',
  templateUrl: './match-info.component.html',
  styleUrls: ['./match-info.component.scss']
})
export class MatchInfoComponent implements OnInit {

  battingColumns: any[] = ['batter','runs','fours','sixes','balls_faced']
  constructor() { }

  ngOnInit(): void {
  }

}
