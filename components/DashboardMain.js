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
