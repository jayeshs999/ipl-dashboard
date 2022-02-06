import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { API } from 'src/app/API';
import { Venue } from './venue.interface';

@Component({
  selector: 'app-add-venue',
  templateUrl: './add-venue.component.html',
  styleUrls: ['./add-venue.component.scss']
})
export class AddVenueComponent implements OnInit {

  newVenue : Venue = {name:'',country:'',city:'',capacity:0};
  constructor(private http: HttpClient, private snackbar : MatSnackBar) { }

  ngOnInit(): void {
  }

  onSubmit(){
    console.log(this.newVenue)
    this.http.post(API.serverURL + API.addVenue,this.newVenue).subscribe((res : any)=>{
      this.snackbar.open(res.message, '', {duration:2000})
      this.newVenue.name = '';
      this.newVenue.country = '';
      this.newVenue.city = '';
      this.newVenue.capacity = 0;
    },(err)=>{
      this.snackbar.open('Some error occured. Please try again', '',{duration:2000});
    })
  }

}
