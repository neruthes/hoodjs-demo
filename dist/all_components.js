Hood.define('test.Button', {
    init: function () { },
    render: function () {
        return `<button hood-fd="${this.__fd}" hood-ev="click">
            ${this._src.text}
        </button>`;
    },
    states: {},
    methods: {
        on_click: function (argv) {
            Hood.call(this._ownerFd, this._src.on_click, {
                ev: argv.ev
            });
        }
    }
});
Hood.define('test.DashboardMain', {
    init: function () {
        let _this = this;
        _this.getNginxData();
        _this.getTincData();
        // NavBar
        _this.globalNavBarFd = Hood.spawn('test.NavBar', _this._src, _this.__fd).__fd;
        // Nginx & Tinc
        _this.contentNginxFd = Hood.spawn('test.Content.Nginx', _this._states.nginxPageData, _this.__fd).__fd;
        _this.contentTincFd = Hood.spawn('test.Content.Tinc', _this._states.tincPageData, _this.__fd).__fd;
    },
    render: function () {
        let _this = this;
        _this._states.activeTab = Hood.getState(_this.globalNavBarFd, 'activeTab');
        let fdKeyName = ({
            nginx: 'contentNginxFd',
            tinc: 'contentTincFd',
        })[_this._states.activeTab];
        let contentAreaHtml = Hood.call(_this[fdKeyName], 'render');
        return `<div hood-fd="${_this.__fd}">
            ${Hood.call(_this.globalNavBarFd, 'render')}
            ${contentAreaHtml}
        </div>`;
    },
    states: {
        nginxPageData: {},
        tincPageData: {}
    },
    methods: {
        getNginxData: function () {
            this._states.nginxPageData = {
                instances: [
                    { title: 'GitHub', draft_title: 'GitHub', domain: 'github.com', draft_domain: 'github.com', id: 2001, isActive: true },
                    { title: 'Amazon', draft_title: 'Amazon', domain: 'amazon.com', draft_domain: 'amazon.com', id: 2002, isActive: false },
                    { title: 'Twitter', draft_title: 'Twitter', domain: 'twitter.com', draft_domain: 'twitter.com', id: 2003, isActive: false },
                ]
            };
        },
        getTincData: function () {
            this._states.tincPageData = {
                instances: [
                    { title: 'MyVPN', draft_title: 'MyVPN', id: 2001, isActive: true }
                ]
            };
        },
        setNginxData: function () {},
        setTincData: function () {},
        on_click: function () {}
    }
});

Hood.define('test.Content.Tinc', {
    init: function () {},
    render: function () {
        return `<div hood-fd="${this.__fd}" style="padding: 100px 20px 0;">Not Implemented Yet</div>`;
    },
    states: { },
    methods: { }
});
Hood.define('test.InputGroup.Text', {
    init: function () { },
    render: function () {
        let _this = this;
        _this._states.value = Hood.getSrcData(_this._ownerFd, _this._src.fieldName);
        return `<div hood-fd="${_this.__fd}" style="${this._src.style.group}">
            <label style="${this._src.style.label}">${_this._src.label}</label>
            <input hood-ev="input" type="text"
                placeholder="${_this._src.placeholder}"
                value="${Hood.getSrcData(_this._ownerFd, _this._src.tmpValFieldName)}"
                style="${this._src.style.input}"
                onfocus="Hood.call(${_this.__fd}, 'on_focus', arguments[0])"
                onblur="Hood.call(${_this.__fd}, 'on_blur', arguments[0])"
            />
        </div>`;
    },
    states: {
        value: null
    },
    methods: {
        getValue: function () {
            return document.querySelector(`[hood-fd="${this.__fd}"] > input`).value;
        },
        on_input: function (argv) {
            this._states.value = argv.ev.target.value;
            Hood.call(this._ownerFd, this._src.on_input, {
                ev: argv.ev,
                fd: this.__fd,
                fieldName: this._src.fieldName
            });
        },
        on_focus: function (ev) {
            document.querySelector(`[hood-fd="${this.__fd}"] > input`).style = this._src.style.input + this._src.style.input_extra_focus;
            Hood.call(this._ownerFd, 'childInputOnFocus', {
                ev: ev,
                srcFd: this.__fd
            })
        },
        on_blur: function (ev) {
            document.querySelector(`[hood-fd="${this.__fd}"] > input`).style = this._src.style.input;
            Hood.call(this._ownerFd, 'childInputOnBlur', {
                ev: ev,
                srcFd: this.__fd
            })
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
            _this._states.activeTab = argv.tabId;
            _this._src.tabs.forEach(function (tabDefPtr) {
                if (tabDefPtr.id === _this._states.activeTab) {
                    tabDefPtr.isActive = true;
                } else {
                    tabDefPtr.isActive = false;
                };
            });
            Hood.call(_this._ownerFd, '_rerender');
        }
    }
});

Hood.define('test.NavBar.Tab', {
    init: function () { },
    render: function () {
        return `<div hood-fd="${this.__fd}" hood-click="on_click" data-tab-id="${this._src.id}" style="
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
        on_click: function (ev) {
            let _this = this;
            Hood.call(this._ownerFd, 'tabClick', {
                rawEvent: ev,
                tabId: _this._src.id
            });
        }
    }
});
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
        activeInstance: null // instanceId, <Number>
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
        return `<div hood-fd="${this.__fd}" hood-click="on_click" style="
            font-family: 'JetBrains Mono NL', 'Noto Sans', sans-serif;
            box-sizing: border-box;
            background: ${this._src.isActive ? '#EEE' : '#FFF'};
            border-left: 5px solid ${this._src.isActive ? '#09F' : '#FFF'};
            padding: 12px 12px;
        ">
            <div>
                <div style="font-size: 22px;">${this._src.title}</div>
                <div style="font-size: 14px;">${this._src.domain}</div>
            </div>
        </div>`;
    },
    states: {},
    methods: {
        on_click: function (ev) {
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
        let _this = this;
        let commonStyles = {
            group: `margin: 0 0 15px;`,
            label: `font-size: 18px; display: inline-block; width: 130px; margin: 0 20px 0 0;`,
            input: `font-size: 18px; border: 1px solid #000; border-radius: 5px; outline: none; padding: 4px 5px;`,
            input_extra_focus: `box-shadow: rgba(0, 0, 0, 0.3) 0 0 7px 1px;`,
        }
        let inputGroupEntity_title = Hood.spawn('test.InputGroup.Text', {
            label: 'Title',
            placeholder: 'Site Title',
            fieldName: 'title',
            tmpValFieldName: 'draft_title',
            style: commonStyles,
            on_input: 'on_input_any'
        }, _this.__fd);
        let inputGroupEntity_domain = Hood.spawn('test.InputGroup.Text', {
            label: 'Domain',
            placeholder: 'example.com',
            fieldName: 'domain',
            tmpValFieldName: 'draft_domain',
            style: commonStyles,
            on_input: 'on_input_any'
        }, _this.__fd);
        let inputGroupEntity_button = Hood.spawn('test.Button', {
            text: 'Save',
            on_click: 'saveBtnClick'
        }, _this.__fd);
        _this.formfd_title = inputGroupEntity_title.__fd;
        _this.formfd_domain = inputGroupEntity_domain.__fd;
        _this.formfd_saveBtn = inputGroupEntity_button.__fd;
        _this._src.draft_title = _this._src.title.slice(0);
        _this._src.draft_domain = _this._src.domain.slice(0);
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
            <div>
                ${Hood.call(this.formfd_title, 'render')}
                ${Hood.call(this.formfd_domain, 'render')}
                ${Hood.call(this.formfd_saveBtn, 'render')}
            </div>
        </div>`;
    },
    states: {},
    methods: {
        on_input_title: function (argv) {
            // TODO: Should be removed
            this._src.draft_title = Hood.getState(this.formfd_title, 'value');
        },
        on_input_any: function (argv) {
            this._src['draft_' + argv.fieldName] = Hood.getState(argv.fd, 'value');
        },
        saveBtnClick: function (argv) {
            this._src.title = this._src.draft_title;
            this._src.domain = this._src.draft_domain;
            Hood.call(this._ownerFd, '_rerender');
        },
        childInputOnFocus: function (argv) {
        },
        childInputOnBlur: function (argv) {
        },
        on_click: function (argv) {}
    }
});
