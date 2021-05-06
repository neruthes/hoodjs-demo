const ListItem = function (argv) {
    this.argv = argv;
    this.argv.uuid = Math.random().toString().slice(2);
    ComponentInstanceRegistry[this.argv.uuid] = this;
};

ListItem.prototype.render = function () {
    return `<div ce-click="true" ce-uuid="${this.argv.uuid}" ce-index="${this.argv.index}">
        <div>${this.argv.title}</div>
        <small ce-click="true" ce-method="shift">[Shift]</small>
    </div>`;
};
ListItem.prototype.clickEvent = function (e) {
    alert(`My title is ${this.argv.title}`);
    // this.parent.childClick(this);
};
ListItem.prototype.shift = function (e) {
    // this.parent.destroyChild(this);
    if (this.argv.shiftCase === 0) {
        this.argv.shiftCase = 1;
        this.argv.title = this.argv.title.toUpperCase();
    } else {
        this.argv.shiftCase = 0;
        this.argv.title = this.argv.title.toLowerCase();
    };
    // alert(`shift!`);
    // this.parent.childShift(this);
    document.querySelector(`[ce-uuid="${this.argv.uuid}"]`).innerHTML = this.render();
};

// Create instance
// let li = new ListItem({title:'Hello',state:'active'});
