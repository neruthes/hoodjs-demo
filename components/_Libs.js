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
