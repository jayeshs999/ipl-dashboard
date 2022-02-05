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
      icon : 'public'
    },
    {
      name : 'Player',
      path : '/players/1',
      icon : 'person',
    },
    {
      name : 'Points Table',
      path : '/pointstable/2011',
      icon : 'poll'
    },
    {
      name : 'Venue',
      path : '/venues',
      icon : 'location_city',
    },
    {
      name : 'Add Venue',
      path : '/venues/add',
      icon : 'add',
    }
  ]

}
