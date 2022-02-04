import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { API } from 'src/app/API';
import { Venue } from './venue.interface';

@Component({
  selector: 'app-add-venue',
  templateUrl: './add-venue.component.html',
  styleUrls: ['./add-venue.component.scss']
})
export class AddVenueComponent implements OnInit {

  newVenue : Venue = {name:'',country:'',city:'',capacity:0};
  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  onSubmit(){
    console.log(this.newVenue)
    this.http.post(API.serverURL + API.addVenue,this.newVenue).subscribe((res)=>{
      this.newVenue.name = '';
      this.newVenue.country = '';
      this.newVenue.city = '';
      this.newVenue.capacity = 0;
    })
  }

}
