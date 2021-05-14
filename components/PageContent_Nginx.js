Hood.define('test.Content.Nginx', {
    init: function () {
        let _this = this;
        let listEntity = Hood.spawn('test.Content.Nginx.List', _this._src, _this.__fd);
        _this.listEntityFd = listEntity.__fd;
        let detailEntity = Hood.spawn(
            'test.Content.Nginx.DetailPanel',
            _this._src.instances.filter(item => item.id === Hood.getState(_this.listEntityFd, 'activeInstance'))[0],
            _this.__fd
        );
        _this.detailEntityFd = detailEntity.__fd;
        return 0;
    },
    render: function () {
        let _this = this;
        return `<div hood-fd="${_this.__fd}">
            ${Hood.call(_this.listEntityFd, 'render')}
            ${Hood.call(_this.detailEntityFd, 'render')}
        </div>`;
    },
    states: {},
    methods: {
        tabClick: function (argv) {
            let _this = this;
            Hood.rebind(
                _this.detailEntityFd,
                _this._src.instances.filter(item => item.id === Hood.getState(_this.listEntityFd, 'activeInstance'))[0]
            );
            Hood.call(_this.detailEntityFd, '_rerender');
        }
    }
});

Hood.define('test.Content.Nginx.List', {
    init: function () {
        let _this = this;
        _this._states.activeInstance = _this._src.instances[0].id;
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
                let niptr = Hood.spawn('test.Content.Nginx.ListItem', itemData, _this.__fd);
                return niptr.render();
            }).join('');
        },
        tabClick: function (argv) {
            let _this = this;
            // argv.instanceId
            // console.log(`clicked argv.instanceId: ${argv.instanceId}`);
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
            // app.setActiveNginxInstance(_this._states.activeInstance);
            Hood.call(_this._ownerFd, 'tabClick', {
                instanceId: argv.instanceId
            });
        }
    }
});

Hood.define('test.Content.Nginx.ListItem', {
    init: function () {
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
    states: {},
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

Hood.define('test.Content.Nginx.DetailPanel', {
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
    states: {},
    methods: {
    }
});
