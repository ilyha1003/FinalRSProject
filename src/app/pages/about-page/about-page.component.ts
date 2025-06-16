import { Component } from '@angular/core';
import { teamMembers } from './team-data';

@Component({
  selector: 'app-about-page',
  imports: [],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss',
})
export class AboutPageComponent {
  public teamMembers = teamMembers;
}
