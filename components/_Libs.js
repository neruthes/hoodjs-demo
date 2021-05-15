Hood.define('test.InputGroup.Text', {
    init: function () { },
    render: function () {
        let _this = this;
        _this._states.value = Hood.getSrcData(_this._ownerFd, _this._src.fieldName);
        return `<div hood-fd="${_this.__fd}" style="${this._src.style.group}">
            <label style="${this._src.style.label}">${_this._src.label}</label>
            <input hood-ev="input focus blur" type="text"
                placeholder="${_this._src.placeholder}"
                value="${Hood.getSrcData(_this._ownerFd, _this._src.tmpValFieldName)}"
                style="${this._src.style.input}"
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
            console.log(`test.InputGroup.Text - on_input`);
            console.log(argv.ev.target.value);
            this._states.value = argv.ev.target.value;
            Hood.call(this._ownerFd, this._src.on_input, {
                ev: argv.ev,
                fd: this.__fd,
                fieldName: this._src.fieldName
            });
        }
    }
});
