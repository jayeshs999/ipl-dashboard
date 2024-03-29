import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { API } from '../API';

@Component({
  selector: 'app-pointstable',
  templateUrl: './pointstable.component.html',
  styleUrls: ['./pointstable.component.scss']
})
export class PointstableComponent implements OnInit {

  tableColumns: any[] = ['team_name', 'num_matches', 'won', 'lost', 'tied', 'nr', 'points']
  seasonYear: any;
  pointsTable: any;
  seasonYears: any[] =  []

  constructor(private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private snackbar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: any) => {
      this.seasonYear = parseInt(params.year);
      this.http.get(API.serverURL + API.getPointsTable).subscribe((data:any)=>{
        this.seasonYears = data.sort()
        if (this.seasonYear) {
          this.http.get(API.serverURL + API.getPointsTable + this.seasonYear).subscribe((data: any) => {
            this.pointsTable = data;
          })
        }
        else {
          this.snackbar.open(`Please choose a${params.year ? ' valid' : ''} season year`, '', { duration: 2000 })
        }  
      })
    })
  }

  navigateTo(value: number) {
    this.router.navigate(['/pointstable', value.toString()])
  }

}
