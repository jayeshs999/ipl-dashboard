import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Chart } from 'chart.js';
import { API } from 'src/app/API';
import { FirstScoreOptions } from './first-score.config';
import { MatchOutlineOptions } from './match-outline.config';
import { VenueInfo } from './venue-info.interface';

@Component({
  selector: 'app-venue-info',
  templateUrl: './venue-info.component.html',
  styleUrls: ['./venue-info.component.scss']
})
export class VenueInfoComponent implements OnInit {

  infoTableColumns : any[] = ['venue_name','address','capacity','total_matches','highest_total','lowest_total','highest_score_chased']
  venueInfo : VenueInfo;
  venueID : number;
  @ViewChild('matchOutlineChart') matchOutlineChart: ElementRef;
  @ViewChild('firstScoreChart') firstScoreChart: ElementRef;

  constructor(private http: HttpClient,
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe((params:any)=>{
      this.venueID = params.venue_id;
      this.http.get<VenueInfo>(API.serverURL + API.getVenue + this.venueID).subscribe((data)=>{
        this.venueInfo = data;
        let ctx = this.matchOutlineChart.nativeElement.getContext('2d');
        let chart = new Chart(ctx, MatchOutlineOptions(this.venueInfo.matchOutline))

        ctx = this.firstScoreChart.nativeElement.getContext('2d');
        chart = new Chart(ctx,FirstScoreOptions(this.venueInfo.scoreOutline.season_year, this.venueInfo.scoreOutline.avg_first_score))
      })
    })

  }

}
