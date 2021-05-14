Hood.define('test.Button', {
    init: function () {},
    render: function () {
        return `<button hood-fd="${this.__fd}" hood-method="click">
            ${this._src.text}
        </button>`;
    },
    states: {},
    methods: {
        click: function (ev) {
            Hood.call(this._ownerFd, 'childButtonClick', {
                rawEvent: ev,
                masterMethod: this._src.masterMethod
            });
        }
    }
});
