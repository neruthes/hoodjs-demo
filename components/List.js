const List = function (argv) {
    this.argv = argv;
    this.argv.uuid = Math.random().toString().slice(2);
    ComponentInstanceRegistry[this.argv.uuid] = this;
    this.argv.childrenData = this.argv.childrenData || [];
};

List.prototype.render = function () {
    return `<div ce-uuid="${this.uuid}">
        <div>${this.renderChildren()}</div>
    </div>`;
};
// List.prototype.setChildren = function (childrenArray) {
// };
List.prototype.renderChildren = function () {
    return this.argv.childrenData.map(function (item, i) {
        let newItem = item;
        newItem.parent = listOfItems;
        newItem.index = i;
        let itemObj = new ListItem(item);
        return itemObj.render();
    }).join('');
};
List.prototype.childShift = function (childPtr) {
    this.argv.childrenData[childPtr.index].title = childPtr.title;
    console.log(`child title updated: ${this.argv.childrenData[childPtr.index].title}`);
};

// Create instance
// let li = new List({title:'Hello',state:'active'});
