Hood.define('test.ListItem', {
    render: function () {
        if (this.isDeleted) {
            return `<div hood-fd="${this.__fd}"></div>`;
        } else {
            return `<div hood-fd="${this.__fd}">
                <div>
                    <div>${this._src.title}</div>
                    <button hood-method="shift">Shift</button>
                </div>
            </div>`;
        };
    },
    methods: {
        shift: function () {
            if (this._src.shiftCase === 0) {
                this._src.shiftCase = 1;
                this._src.title = this._src.title.toUpperCase();
            } else {
                this._src.shiftCase = 0;
                this._src.title = this._src.title.toLowerCase();
            };
            this._rerender();
        }
    }
});
