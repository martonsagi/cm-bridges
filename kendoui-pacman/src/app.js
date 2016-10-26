import {Router, RouterConfiguration} from 'aurelia-router';
import {WebAPI} from './web-api';

export class App {
  router: Router;
  static inject() { return [WebAPI]; }

  constructor(api) {
    this.api = api;
  }

  configureRouter(config: RouterConfiguration, router: Router) {
    config.title = 'Contacts';
    config.map([
      { route: '',              moduleId: 'no-selection',   title: 'Select'},
      { route: 'contacts/:id',  moduleId: 'contact-detail', name: 'contacts'}
    ]);

    this.router = router;
  }
}
