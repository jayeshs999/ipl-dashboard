import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { API } from 'src/app/API';

@Component({
  selector: 'app-venue-list',
  templateUrl: './venue-list.component.html',
  styleUrls: ['./venue-list.component.scss']
})
export class VenueListComponent implements OnInit {

  tableColumns : any[] = ['venue_name','address','capacity','total_matches']
  venueTable:any;


  constructor(private http : HttpClient) { }

  ngOnInit(): void {
    this.http.get(API.serverURL + API.getVenues).subscribe((data:any)=>{
      this.venueTable = data;
    })
  }

}
