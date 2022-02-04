import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { API } from '../API';

@Component({
  selector: 'app-pointstable',
  templateUrl: './pointstable.component.html',
  styleUrls: ['./pointstable.component.scss']
})
export class PointstableComponent implements OnInit {

  tableColumns : any[] = ['team_name','num_matches','won','lost','tied','nr','points']
  seasonYear : any;
  pointsTable:any;

  constructor(private http: HttpClient,
    private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe((params:any)=>{
      this.seasonYear = params.year;
      this.http.get(API.serverURL + API.getPointsTable + this.seasonYear).subscribe((data:any)=>{
        console.log(data);
        this.pointsTable = data;
      })
    })
  }

}
