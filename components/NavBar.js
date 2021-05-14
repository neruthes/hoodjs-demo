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
    states: {},
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
