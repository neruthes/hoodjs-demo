Hood.define('test.Button', {
    init: function () {},
    render: function () {
        return `<button hood-fd="${this.__fd}" hood-method="click">
            ${this._src.text}
        </button>`;
    },
    methods: {
        click: function (ev) {
            Hood.call(this._ownerFd, 'childButtonClick', {
                rawEvent: ev,
                masterMethod: this._src.masterMethod
            });
        }
    }
});
Hood.define('test.NavBar', {
    init: function () {
        let _this = this;
        _this._tabsFd = [];
        _this._src.tabs.map(function (tabDef) {
            let tabPtr = Hood.spawn('test.NavBar.Tab', tabDef, _this.__fd);
            _this._tabsFd.push(tabPtr.__fd);
            if (tabDef.isActive) {
                _this._states.activeTab = tabDef.id;
            };
        });
    },
    render: function () {
        return `<div hood-fd="${this.__fd}" style="
            font-family: 'JetBrains Mono NL', 'Noto Sans', sans-serif;
            background: #FFF;
            box-sizing: border-box;
            position: fixed;
            z-index: 9999;
            top: 0; left: 0;
            width: 100vw; height: 80px;
            border-bottom: 1px solid #000;
        ">
            <div style="display: inline-block; padding-right: 30px;">[Logo]</div>
            <div style="display: inline-block;">
                ${this.renderChildren()}
            </div>
        </div>`;
    },
    states: {
        activeTab: null
    },
    methods: {
        renderChildren: function () {
            let _this = this;
            return _this._tabsFd.map(function (fd) {
                return Hood.call(fd, 'render');
            }).join('');
        },
        tabClick: function (argv) {
            let _this = this;
            console.log(`clicked argv.tabId: ${argv.tabId}`);
            _this._states.activeTab = argv.tabId;
            _this._src.tabs.forEach(function (tabDefPtr) {
                if (tabDefPtr.id === _this._states.activeTab) {
                    tabDefPtr.isActive = true;
                } else {
                    tabDefPtr.isActive = false;
                };
            });
            _this._rerender();
            app.setActiveTab(_this._states.activeTab);
        }
    }
});

Hood.define('test.NavBar.Tab', {
    init: function () { },
    render: function () {
        return `<div hood-fd="${this.__fd}" hood-method="click" data-tab-id="${this._src.id}" style="
            font-family: 'JetBrains Mono NL', 'Noto Sans', sans-serif;
            box-sizing: border-box;
            font-size: 22px;
            ${this._src.isActive ? 'background: #EEE;' : ''}
            display: inline-block;
            padding: 15px 30px;
        ">
            ${this._src.title}
        </div>`
    },
    methods: {
        click: function (ev) {
            let _this = this;
            Hood.call(this._ownerFd, 'tabClick', {
                rawEvent: ev,
                tabId: _this._src.id
            });
        }
    }
});
// Hood.define('test.PageContent', {});
Hood.define('test.Nginx.List', {
    init: function () {
        return 0;
    },
    render: function () {
        return `<div hood-fd="${this.__fd}" style="
            font-family: 'JetBrains Mono NL', 'Noto Sans', sans-serif;
            box-sizing: border-box;
            background: #FFF;
            border-right: 1px solid #000;
            position: fixed;
            z-index: 5000;
            top: 0px; left: 0px;
            width: 280px; height: 100vh;
            padding: 90px 0 0;
        ">
            
            <div style="">${this.renderChildren()}</div>
        </div>`;
    },
    states: {
        activeInstance: null
        // instanceId
    },
    methods: {
        renderChildren: function () {
            let _this = this;
            return _this._src.instances.map(function (itemData) {
                let niptr = Hood.spawn('test.Nginx.ListItem', itemData, _this.__fd);
                return niptr.render();
            }).join('');
        },
        tabClick: function (argv) {
            let _this = this;
            // argv.instanceId
            console.log(`clicked argv.instanceId: ${argv.instanceId}`);
            _this._states.activeInstance = argv.instanceId;
            _this._src.instances.forEach(function (instanceDefPtr) {
                if (instanceDefPtr.id === _this._states.activeInstance) {
                    instanceDefPtr.isActive = true;
                } else {
                    instanceDefPtr.isActive = false;
                };
            });
            _this._rerender();
            _this._src.currentActive = _this._states.activeInstance;
            app.setActiveNginxInstance(_this._states.activeInstance);
        }
    }
});

Hood.define('test.Nginx.ListItem', {
    init: function () {
        // this._btnPtr = Hood.spawn('test.Button', {
            // text: `Shift`,
            // masterMethod: 'shift'
        // }, this.__fd);
    },
    render: function () {
        return `<div hood-fd="${this.__fd}" hood-method="click" style="
            font-family: 'JetBrains Mono NL', 'Noto Sans', sans-serif;
            box-sizing: border-box;
            background: ${this._src.isActive ? '#EEE' : '#FFF'};
            border-left: 5px solid ${this._src.isActive ? '#09F' : '#FFF'};
            padding: 12px 12px;
        ">
            <div>
                <div>${this._src.title}</div>
            </div>
        </div>`;
    },
    methods: {
        click: function (ev) {
            let _this = this;
            Hood.call(this._ownerFd, 'tabClick', {
                rawEvent: ev,
                instanceId: _this._src.id
            });
        }
    }
});

Hood.define('test.Nginx.DetailPanel', {
    init: function () {
    },
    render: function () {
        return `<div hood-fd="${this.__fd}" style="
            font-family: 'JetBrains Mono NL', 'Noto Sans', sans-serif;
            box-sizing: border-box;
            position: fixed;
            top: 80px; left: 280px;
            width: calc(100vw - 280px); height: 100vh;
            padding: 80px 20px 40px;
        ">
            <div>
                <h2>Instance Name: ${this._src.title}</h2>
            </div>
        </div>`;
    },
    methods: {
        click: function (ev) {
            let _this = this;
            Hood.call(this._ownerFd, 'tabClick', {
                rawEvent: ev,
                instanceId: _this._src.id
            });
        }
    }
});
