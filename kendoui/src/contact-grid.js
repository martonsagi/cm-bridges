import {EventAggregator} from 'aurelia-event-aggregator';
import {WebAPI} from './web-api';
import {ContactUpdated, ContactViewed} from './messages';

export class ContactGrid {
  static inject = [WebAPI, EventAggregator];

  dataSource = new kendo.data.DataSource({
      transport: {
          read: (options) => {
              this.api.getContactList().then(contacts => {
                   this.contacts = contacts;
                   options.success(this.contacts);
              });
          },
          update: (options) => {
              this.api.saveContact(options.data)
              .then(() => this.ea.publish(new ContactUpdated(options.data)))
              .then(() => options.success(options.data));
          }
      },
      schema: {
        model: {
            id: 'id'
        }
      }
  })


  constructor(api, ea) {
    this.api = api;
    this.ea = ea;
    this.contacts = [];

    ea.subscribe(ContactViewed, msg => this.select(msg.contact));
    ea.subscribe(ContactUpdated, msg => this.dataSource.read());
  }

  select(contact) {
    this.selectedId = contact.id;
    return true;
  }
}
