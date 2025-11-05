import { Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ResultsPageComponent } from './results-page/results-page.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'results', component: ResultsPageComponent }
];