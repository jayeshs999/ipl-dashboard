import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'IPLDashboard';
  links = [
    {
      name : 'Match',
      path : '/matches',
    },
    {
      name : 'Player',
      path : '/players/x'
    },
    {
      name : 'Points Table',
      path : '/pointstable/x'
    },
    {
      name : 'Venue',
      path : '/venues'
    },
    {
      name : 'Add Venue',
      path : '/venues/add'
    }
  ]

}
