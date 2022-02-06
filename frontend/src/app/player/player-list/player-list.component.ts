import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { API } from 'src/app/API';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrls: ['./player-list.component.scss']
})
export class PlayerListComponent implements OnInit {

  tableColumns : any[] = ['player_name','country_name','batting_hand','bowling_skill']
  playerTable:any;
  numPlayers : number;
  entriesPerPage : number = 10;


  constructor(private http : HttpClient) { }

  getData(start : number, num : number){
    this.http.get(API.serverURL + API.getPlayer,{params:{start : start, num : num}}).subscribe((data:any)=>{
      this.numPlayers = data.num_players;
      this.playerTable = data.data;
    })
  }

  ngOnInit(): void {
    this.getData(0,this.entriesPerPage);
  }

  onPageChange(event:any){
    this.entriesPerPage = event.pageSize;
    this.getData(event.pageIndex*this.entriesPerPage,this.entriesPerPage);
  }
}
