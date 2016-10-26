define('app',['exports', 'aurelia-router', './web-api'], function (exports, _aureliaRouter, _webApi) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.App = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var App = exports.App = function () {
    App.inject = function inject() {
      return [_webApi.WebAPI];
    };

    function App(api) {
      _classCallCheck(this, App);

      this.api = api;
    }

    App.prototype.configureRouter = function configureRouter(config, router) {
      config.title = 'Contacts';
      config.map([{ route: '', moduleId: 'no-selection', title: 'Select' }, { route: 'contacts/:id', moduleId: 'contact-detail', name: 'contacts' }]);

      this.router = router;
    };

    return App;
  }();
});
define('contact-detail',['exports', 'aurelia-event-aggregator', './web-api', './messages', './utility'], function (exports, _aureliaEventAggregator, _webApi, _messages, _utility) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ContactDetail = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var _class, _temp;

  var ContactDetail = exports.ContactDetail = (_temp = _class = function () {
    function ContactDetail(api, ea) {
      _classCallCheck(this, ContactDetail);

      this.api = api;
      this.ea = ea;
    }

    ContactDetail.prototype.activate = function activate(params, routeConfig) {
      var _this = this;

      this.routeConfig = routeConfig;

      return this.api.getContactDetails(params.id).then(function (contact) {
        _this.contact = contact;
        _this.routeConfig.navModel.setTitle(contact.firstName);
        _this.originalContact = JSON.parse(JSON.stringify(contact));
        _this.ea.publish(new _messages.ContactViewed(contact));
      });
    };

    ContactDetail.prototype.save = function save() {
      var _this2 = this;

      this.api.saveContact(this.contact).then(function (contact) {
        _this2.contact = contact;
        _this2.routeConfig.navModel.setTitle(contact.firstName);
        _this2.originalContact = JSON.parse(JSON.stringify(contact));
        _this2.ea.publish(new _messages.ContactUpdated(_this2.contact));
      });
    };

    ContactDetail.prototype.canDeactivate = function canDeactivate() {
      if (!(0, _utility.areEqual)(this.originalContact, this.contact)) {
        var result = confirm('You have unsaved changes. Are you sure you wish to leave?');
        if (!result) {
          this.ea.publish(new _messages.ContactViewed(this.contact));
        }

        return result;
      }

      return true;
    };

    _createClass(ContactDetail, [{
      key: 'canSave',
      get: function get() {
        return this.contact.firstName && this.contact.lastName && !this.api.isRequesting;
      }
    }]);

    return ContactDetail;
  }(), _class.inject = [_webApi.WebAPI, _aureliaEventAggregator.EventAggregator], _temp);
});
define('contact-grid',['exports', 'aurelia-event-aggregator', './web-api', './messages'], function (exports, _aureliaEventAggregator, _webApi, _messages) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ContactGrid = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var ContactGrid = exports.ContactGrid = (_temp = _class = function () {
    function ContactGrid(api, ea) {
      var _this = this;

      _classCallCheck(this, ContactGrid);

      this.dataSource = new kendo.data.DataSource({
        transport: {
          read: function read(options) {
            _this.api.getContactList().then(function (contacts) {
              _this.contacts = contacts;
              options.success(_this.contacts);
            });
          },
          update: function update(options) {
            _this.api.saveContact(options.data).then(function () {
              return _this.ea.publish(new _messages.ContactUpdated(options.data));
            }).then(function () {
              return options.success(options.data);
            });
          }
        },
        schema: {
          model: {
            id: 'id'
          }
        }
      });

      this.api = api;
      this.ea = ea;
      this.contacts = [];

      ea.subscribe(_messages.ContactViewed, function (msg) {
        return _this.select(msg.contact);
      });
      ea.subscribe(_messages.ContactUpdated, function (msg) {
        return _this.dataSource.read();
      });
    }

    ContactGrid.prototype.select = function select(contact) {
      this.selectedId = contact.id;
      return true;
    };

    return ContactGrid;
  }(), _class.inject = [_webApi.WebAPI, _aureliaEventAggregator.EventAggregator], _temp);
});
define('contact-list',['exports', 'aurelia-event-aggregator', './web-api', './messages'], function (exports, _aureliaEventAggregator, _webApi, _messages) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ContactList = undefined;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _class, _temp;

  var ContactList = exports.ContactList = (_temp = _class = function () {
    function ContactList(api, ea) {
      var _this = this;

      _classCallCheck(this, ContactList);

      this.api = api;
      this.ea = ea;
      this.contacts = [];

      ea.subscribe(_messages.ContactViewed, function (msg) {
        return _this.select(msg.contact);
      });
      ea.subscribe(_messages.ContactUpdated, function (msg) {
        console.log(msg);
        var id = msg.contact.id;
        var found = _this.contacts.find(function (x) {
          return x.id === id;
        });
        Object.assign(found, msg.contact);
      });
    }

    ContactList.prototype.created = function created() {
      var _this2 = this;

      this.api.getContactList().then(function (contacts) {
        return _this2.contacts = contacts;
      });
    };

    ContactList.prototype.select = function select(contact) {
      this.selectedId = contact.id;
      return true;
    };

    return ContactList;
  }(), _class.inject = [_webApi.WebAPI, _aureliaEventAggregator.EventAggregator], _temp);
});
define('environment',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.default = {
    debug: true,
    testing: true
  };
});
define('main',['exports', './environment'], function (exports, _environment) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;

  var _environment2 = _interopRequireDefault(_environment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  Promise.config({
    warnings: {
      wForgottenReturn: false
    }
  });

  function configure(aurelia) {
    aurelia.use.standardConfiguration().feature('resources');

    if (_environment2.default.debug) {
      aurelia.use.developmentLogging();
    }

    if (_environment2.default.testing) {
      aurelia.use.plugin('aurelia-testing');
    }

    aurelia.start().then(function () {
      return aurelia.setRoot();
    });
  }
});
define('messages',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var ContactUpdated = exports.ContactUpdated = function ContactUpdated(contact) {
    _classCallCheck(this, ContactUpdated);

    this.contact = contact;
  };

  var ContactViewed = exports.ContactViewed = function ContactViewed(contact) {
    _classCallCheck(this, ContactViewed);

    this.contact = contact;
  };
});
define('no-selection',["exports"], function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var NoSelection = exports.NoSelection = function NoSelection() {
    _classCallCheck(this, NoSelection);

    this.message = "Please Select a Contact.";
  };
});
define('utility',["exports"], function (exports) {
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports.areEqual = areEqual;
	function areEqual(obj1, obj2) {
		return Object.keys(obj1).every(function (key) {
			return obj2.hasOwnProperty(key) && obj1[key] === obj2[key];
		});
	};
});
define('web-api',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var latency = 200;
  var id = 0;

  function getId() {
    return ++id;
  }

  var contacts = [{
    id: getId(),
    firstName: 'John',
    lastName: 'Tolkien',
    email: 'tolkien@inklings.com',
    phoneNumber: '867-5306',
    image: 'http://demos.telerik.com/kendo-ui/content/web/Customers/anton.jpg'
  }, {
    id: getId(),
    firstName: 'Clive',
    lastName: 'Lewis',
    email: 'lewis@inklings.com',
    image: 'http://demos.telerik.com/kendo-ui/content/web/Customers/arout.jpg'
  }, {
    id: getId(),
    firstName: 'Owen',
    lastName: 'Barfield',
    email: 'barfield@inklings.com',
    phoneNumber: '867-5308',
    image: 'http://demos.telerik.com/kendo-ui/content/web/Customers/blonp.jpg'
  }, {
    id: getId(),
    firstName: 'Charles',
    lastName: 'Williams',
    email: 'williams@inklings.com',
    phoneNumber: '867-5309',
    image: 'http://demos.telerik.com/kendo-ui/content/web/Customers/bolid.jpg'
  }, {
    id: getId(),
    firstName: 'Roger',
    lastName: 'Green',
    email: 'green@inklings.com',
    phoneNumber: '867-5310',
    image: 'http://demos.telerik.com/kendo-ui/content/web/Customers/bonap.jpg'
  }];

  var WebAPI = exports.WebAPI = function () {
    function WebAPI() {
      _classCallCheck(this, WebAPI);

      this.isRequesting = false;
    }

    WebAPI.prototype.getContactList = function getContactList() {
      var _this = this;

      this.isRequesting = true;
      return new Promise(function (resolve) {
        setTimeout(function () {
          var results = contacts.map(function (x) {
            return {
              id: x.id,
              firstName: x.firstName,
              lastName: x.lastName,
              email: x.email,
              phoneNumber: x.phoneNumber,
              image: x.image
            };
          });
          resolve(results);
          _this.isRequesting = false;
        }, latency);
      });
    };

    WebAPI.prototype.getContactDetails = function getContactDetails(id) {
      var _this2 = this;

      this.isRequesting = true;
      return new Promise(function (resolve) {
        setTimeout(function () {
          var found = contacts.filter(function (x) {
            return x.id == id;
          })[0];
          resolve(JSON.parse(JSON.stringify(found)));
          _this2.isRequesting = false;
        }, latency);
      });
    };

    WebAPI.prototype.saveContact = function saveContact(contact) {
      var _this3 = this;

      this.isRequesting = true;
      return new Promise(function (resolve) {
        setTimeout(function () {
          var instance = JSON.parse(JSON.stringify(contact));
          var found = contacts.filter(function (x) {
            return x.id == contact.id;
          })[0];

          if (found) {
            var index = contacts.indexOf(found);
            contacts[index] = instance;
          } else {
            instance.id = getId();
            contacts.push(instance);
          }

          _this3.isRequesting = false;
          resolve(instance);
        }, latency);
      });
    };

    return WebAPI;
  }();
});
define('resources/index',['exports'], function (exports) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.configure = configure;
  function configure(config) {
    config.globalResources(['./elements/loading-indicator']);
  }
});
define('resources/elements/loading-indicator',['exports', 'nprogress', 'aurelia-framework'], function (exports, _nprogress, _aureliaFramework) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.LoadingIndicator = undefined;

  var nprogress = _interopRequireWildcard(_nprogress);

  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};

      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
        }
      }

      newObj.default = obj;
      return newObj;
    }
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var LoadingIndicator = exports.LoadingIndicator = (0, _aureliaFramework.decorators)((0, _aureliaFramework.noView)(['nprogress/nprogress.css']), (0, _aureliaFramework.bindable)({ name: 'loading', defaultValue: false })).on(function () {
    function _class() {
      _classCallCheck(this, _class);
    }

    _class.prototype.loadingChanged = function loadingChanged(newValue) {
      if (newValue) {
        nprogress.start();
      } else {
        nprogress.done();
      }
    };

    return _class;
  }());
});
define('text!app.html', ['module'], function(module) { module.exports = "<template>\r\n  <require from=\"aurelia-kendoui-bridge/tabstrip/tabstrip\"></require>\r\n  <require from=\"bootstrap/css/bootstrap.css\"></require>\r\n  <require from=\"./styles.css\"></require>\r\n  <require from=\"./contact-detail\"></require>\r\n  <require from=\"./contact-list\"></require>\r\n  <require from=\"./contact-grid\"></require>\r\n\r\n  <nav class=\"navbar navbar-default navbar-fixed-top\" role=\"navigation\">\r\n    <div class=\"navbar-header\">\r\n      <a class=\"navbar-brand\" href=\"#\">\r\n        <i class=\"fa fa-user\"></i>\r\n        <span>Contacts - KendoUI edition</span>\r\n      </a>\r\n    </div>\r\n  </nav>\r\n\r\n  <loading-indicator loading.bind=\"router.isNavigating || api.isRequesting\"></loading-indicator>\r\n\r\n  <div class=\"container\">\r\n \r\n    <div id=\"tabstrip\" ak-tabstrip=\"k-animation.bind: { open: { effects: 'fadeIn' } }\">\r\n      <ul>\r\n        <li class=\"k-state-active\">\r\n          KendoUI Core\r\n        </li>\r\n\r\n        <li>\r\n          KendoUI PRO\r\n        </li>\r\n      </ul> \r\n\r\n      <div>\r\n        <div id=\"core\" class=\"row\">\r\n          <contact-list class=\"col-md-4\"></contact-list>\r\n\r\n          <router-view class=\"col-md-8\"></router-view>                 \r\n        </div>\r\n      </div>\r\n      \r\n      <div>\r\n        <contact-grid></contact-grid>\r\n      </div>\r\n\r\n    </div>  \r\n\r\n  </div>\r\n</template>"; });
define('text!styles.css', ['module'], function(module) { module.exports = "body { padding-top: 70px; }\r\n\r\nsection {\r\n  margin: 0 20px;\r\n}\r\n\r\na:focus {\r\n  outline: none;\r\n}\r\n\r\n.navbar-nav li.loader {\r\n    margin: 12px 24px 0 6px;\r\n}\r\n\r\n.no-selection {\r\n  margin: 20px;\r\n}\r\n\r\n.contact-list {\r\n  overflow-y: auto;\r\n  border: 1px solid #ddd;\r\n  padding: 10px;\r\n}\r\n\r\n.panel {\r\n  margin: 20px;\r\n}\r\n\r\n.button-bar {\r\n  right: 0;\r\n  left: 0;\r\n  bottom: 0;\r\n  border-top: 1px solid #ddd;\r\n  background: white;\r\n}\r\n\r\n.button-bar > button {\r\n  float: right;\r\n  margin: 20px;\r\n}\r\n\r\n#core.row {\r\n  margin-left: 0;\r\n  margin-right: 0;\r\n}\r\n\r\n.list-group-item {\r\n  list-style: none;\r\n}\r\n\r\n.list-group-item > a {\r\n  text-decoration: none;\r\n}\r\n\r\n.list-group-item.active h4, \r\n.list-group-item.active p {\r\n  color: white !important;\r\n}\r\n\r\n.contact-list img {\r\n    display: inline-block;\r\n    margin: 5px 15px 5px 5px;\r\n    border: 1px solid #ccc;\r\n    border-radius: 50%;\r\n}\r\n.list-group-item-heading {\r\n  margin-top: 15px;\r\n}\r\n.details {\r\n    display: inline-block;\r\n    vertical-align: top;\r\n}\r\n\r\n\r\n\r\n/* set a border-box model only to elements that need it */\r\n.form-control,\r\n.container,\r\n.container-fluid,\r\n.row,\r\n.col-xs-1, .col-sm-1, .col-md-1, .col-lg-1,\r\n.col-xs-2, .col-sm-2, .col-md-2, .col-lg-2,\r\n.col-xs-3, .col-sm-3, .col-md-3, .col-lg-3,\r\n.col-xs-4, .col-sm-4, .col-md-4, .col-lg-4,\r\n.col-xs-5, .col-sm-5, .col-md-5, .col-lg-5,\r\n.col-xs-6, .col-sm-6, .col-md-6, .col-lg-6,\r\n.col-xs-7, .col-sm-7, .col-md-7, .col-lg-7,\r\n.col-xs-8, .col-sm-8, .col-md-8, .col-lg-8,\r\n.col-xs-9, .col-sm-9, .col-md-9, .col-lg-9,\r\n.col-xs-10, .col-sm-10, .col-md-10, .col-lg-10,\r\n.col-xs-11, .col-sm-11, .col-md-11, .col-lg-11,\r\n.col-xs-12, .col-sm-12, .col-md-12, .col-lg-12 {\r\n    -webkit-box-sizing: border-box;\r\n    -moz-box-sizing: border-box;\r\n    box-sizing: border-box;\r\n}\r\n\r\n.customer-photo {\r\n    display: inline-block;\r\n    width: 32px;\r\n    height: 32px;\r\n    border-radius: 50%;\r\n    background-size: 32px 35px;\r\n    background-position: center center;\r\n    vertical-align: middle;\r\n    line-height: 32px;\r\n    box-shadow: inset 0 0 1px #999, inset 0 0 10px rgba(0,0,0,.2);\r\n    margin-left: 5px;\r\n}\r\n\r\n.customer-name {\r\n    display: inline-block;\r\n    vertical-align: middle;\r\n    line-height: 32px;\r\n    padding-left: 3px;\r\n}"; });
define('text!contact-detail.html', ['module'], function(module) { module.exports = "<template>\r\n  <require from=\"aurelia-kendoui-bridge/maskedtextbox/maskedtextbox\"></require>\r\n\r\n  <div class=\"panel panel-primary\">\r\n    <div class=\"panel-heading\">\r\n      <h3 class=\"panel-title\">Profile</h3>\r\n    </div>\r\n    <div class=\"panel-body\">\r\n      <form role=\"form\" class=\"form-horizontal\">\r\n        <div class=\"form-group\">\r\n          <label class=\"col-sm-2 control-label\">First Name</label>\r\n          <div class=\"col-sm-10\">\r\n            <input type=\"text\" placeholder=\"first name\" class=\"form-control\" value.bind=\"contact.firstName\">\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"form-group\">\r\n          <label class=\"col-sm-2 control-label\">Last Name</label>\r\n          <div class=\"col-sm-10\">\r\n            <input type=\"text\" placeholder=\"last name\" class=\"form-control\" value.bind=\"contact.lastName\">\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"form-group\">\r\n          <label class=\"col-sm-2 control-label\">Email</label>\r\n          <div class=\"col-sm-10\">\r\n            <input type=\"text\" placeholder=\"email\" class=\"form-control\" value.bind=\"contact.email\">\r\n          </div>\r\n        </div>\r\n\r\n        <div class=\"form-group\">\r\n          <label class=\"col-sm-2 control-label\">Phone Number</label>\r\n          <div class=\"col-sm-10\">\r\n            <input type=\"text\" placeholder=\"phone number\" class=\"form-control\" ak-maskedtextbox=\"k-value.bind: contact.phoneNumber; k-mask: 000-0000\">\r\n          </div>\r\n        </div>\r\n      </form>\r\n    </div>\r\n  </div>\r\n\r\n  <div class=\"button-bar\">\r\n    <button class=\"btn btn-success\" click.delegate=\"save()\" disabled.bind=\"!canSave\">Save</button>\r\n  </div>\r\n</template>"; });
define('text!contact-grid.html', ['module'], function(module) { module.exports = "<template>\r\n  <require from=\"aurelia-kendoui-bridge/grid/grid\"></require>\r\n  <require from=\"aurelia-kendoui-bridge/grid/col\"></require>\r\n  <require from=\"aurelia-kendoui-bridge/common/template\"></require>\r\n\r\n  <ak-grid k-data-source.bind=\"dataSource\" k-editable=\"inline\">\r\n    <ak-col k-title=\"Contact\">\r\n      <ak-template>\r\n        <div class='customer-photo' css=\"background-image: url(${image});\"></div>\r\n        <div class='customer-name'>${firstName} ${lastName}</div>\r\n      </ak-template>\r\n    </ak-col>\r\n    <ak-col k-title=\"First name\" k-field=\"firstName\"></ak-col>\r\n    <ak-col k-title=\"Last name\" k-field=\"lastName\"></ak-col>\r\n    <ak-col k-title=\"E-mail\" k-field=\"email\"></ak-col>\r\n    <ak-col k-title=\"Phone\" k-field=\"phoneNumber\"></ak-col>\r\n    <ak-col k-command.bind=\"['edit']\" k-title=\"&nbsp;\" width=\"250px\"></ak-col>\r\n  </ak-grid>\r\n</template>"; });
define('text!contact-list.html', ['module'], function(module) { module.exports = "<template>\r\n  <require from=\"aurelia-kendoui-bridge/panelbar/panelbar\"></require>\r\n\r\n  <div class=\"contact-list\">\r\n    <ak-panel-bar>\r\n      <li class=\"k-state-active\">\r\n        <span class=\"k-link k-state-selected\">My Teammates</span>\r\n        <div repeat.for=\"contact of contacts\" class=\"list-group-item ${contact.id === $parent.selectedId ? 'active' : ''}\">\r\n          <a route-href=\"route: contacts; params.bind: {id:contact.id}\" click.delegate=\"$parent.select(contact)\">\r\n            <img src.bind=\"contact.image\" alt=\"${contact.firstName} ${contact.lastName}\">\r\n            <div class=\"details\">\r\n              <h4 class=\"list-group-item-heading\">${contact.firstName} ${contact.lastName}</h4>\r\n              <p class=\"list-group-item-text\">${contact.email}</p>\r\n            </div>\r\n          </a>\r\n        </div>\r\n      </li>       \r\n    </ak-panel-bar>\r\n  </div>\r\n</template>"; });
define('text!no-selection.html', ['module'], function(module) { module.exports = "<template>\r\n  <div class=\"no-selection text-center\">\r\n    <h2>${message}</h2>\r\n  </div>\r\n</template>"; });
//# sourceMappingURL=app-bundle.js.map