Hood.define('test.List', {
    render: function () {
        return `<div hood-fd="${this.__fd}">
            <div>${this.renderChildren()}</div>
        </div>`;
    },
    methods: {
        renderChildren: function () {
            return this._src.childrenData.map(function (itemData) {
                itemData.__parentFd = this.__fd; // `this` is the List instance
                let niptr = Hood.create('test.ListItem', itemData);
                return niptr.render();
            }).join('');
        }
    }
});
