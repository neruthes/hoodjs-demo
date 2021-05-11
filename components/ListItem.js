const ListItem = function (argv) {
    this.argv = argv;
    RegisterComponentInstance(this);
};

ListItem.prototype.render = function () {
    return `<div ce-click="true" ce-uuid="${this.argv._uuid}" ce-index="${this.argv.index}">
        <div>${this.argv.title}</div>
        <small ce-click="true" ce-method="shift">[Shift]</small>
    </div>`;
};
ListItem.prototype.clickEvent = function (e) {
    alert(`My title is ${this.argv.title}`);
};
ListItem.prototype.shift = function (e) {
    if (this.argv.shiftCase === 0) {
        this.argv.shiftCase = 1;
        this.argv.title = this.argv.title.toUpperCase();
    } else {
        this.argv.shiftCase = 0;
        this.argv.title = this.argv.title.toLowerCase();
    };
    document.querySelector(`[ce-uuid="${this.argv._uuid}"]`).innerHTML = this.render();
};
