import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MatchInfoComponent } from './match/match-info/match-info.component';
import { MatchListComponent } from './match/match-list/match-list.component';
import { MatchComponent } from './match/match.component';
import { PlayerInfoComponent } from './player/player-info/player-info.component';
import { PlayerListComponent } from './player/player-list/player-list.component';
import { PlayerComponent } from './player/player.component';
import { PointstableComponent } from './pointstable/pointstable.component';
import { VenueInfoComponent } from './venue/venue-info/venue-info.component';
import { VenueListComponent } from './venue/venue-list/venue-list.component';
import { VenueComponent } from './venue/venue.component';

const routes: Routes = [
  {
    path: 'matches',
    component: MatchComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: MatchListComponent,
      },
      {
        path: ':match_id',
        component: MatchInfoComponent
      }
    ]
  },
  {
    path: 'players',
    component: PlayerComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: PlayerListComponent,
      },
      {
        path: ':player_id',
        component: PlayerInfoComponent
      }
    ]
  },
  {
    path: 'pointstable/:year',
    component: PointstableComponent,
  },
  {
    path: 'venues',
    component: VenueComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: VenueListComponent
      },
      {
        path: ':match_id',
        component: VenueInfoComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo : 'matches'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
