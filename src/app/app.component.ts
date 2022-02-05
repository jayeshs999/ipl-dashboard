import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isOpen : boolean = false;
  title = 'IPLDashboard';
  links = [
    {
      name : 'Match',
      path : '/matches',
      icon : 'public',
      match_type : false
    },
    {
      name : 'Player',
      path : '/players',
      icon : 'person',
      match_type : false
    },
    {
      name : 'Points Table',
      path : '/pointstable',
      icon : 'poll',
      match_type : false
    },
    {
      name : 'Venue',
      path : '/venues',
      icon : 'location_city',
      match_type : true
    },
    {
      name : 'Add Venue',
      path : '/venues/add',
      icon : 'add',
      match_type : true
    }
  ]

}
