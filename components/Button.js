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
