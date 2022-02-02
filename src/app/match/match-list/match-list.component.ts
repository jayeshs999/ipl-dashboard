import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { API } from 'src/app/API';

@Component({
  selector: 'app-match-list',
  templateUrl: './match-list.component.html',
  styleUrls: ['./match-list.component.scss']
})
export class MatchListComponent implements OnInit {

  entriesPerPage = 10;
  matchList : any[];
  numMatches : number;
  constructor(private http : HttpClient) { }

  getData(start:number,num:number){
    this.http.get(API.serverURL+API.getMatches,{
      params : {
        start : start,
        num : num
      }
    }).subscribe((data:any)=>{
      console.log(data);
      this.numMatches = data.num_entries;
      this.matchList = data.matches;
    })
  }

  ngOnInit(): void {
    this.getData(0,this.entriesPerPage);
  }

  onPageChange(event:any){
    this.entriesPerPage = event.pageSize;
    this.getData(event.pageindex,this.entriesPerPage);
  }
}
