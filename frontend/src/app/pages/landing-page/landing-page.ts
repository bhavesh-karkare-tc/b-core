import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPage {
  readonly appName = 'B-Core';
  readonly tagline = 'A powerful platform to manage your operations efficiently.';
  readonly currentYear = new Date().getFullYear();
}
