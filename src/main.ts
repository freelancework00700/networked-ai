import { appConfig } from './app.config';
import { initializeApp } from 'firebase/app';
import { AppComponent } from './app.component';
import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';

// initialize firebase before bootstrapping the app
initializeApp(environment.firebaseConfig);

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
