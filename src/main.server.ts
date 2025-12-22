import { AppComponent } from './app.component';
import { config } from './app/app.config.server';
import { BootstrapContext, bootstrapApplication } from '@angular/platform-browser';

const bootstrap = (context: BootstrapContext) => bootstrapApplication(AppComponent, config, context);

export default bootstrap;
