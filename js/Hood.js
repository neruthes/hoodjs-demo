// =================================
// Basic
// =================================

const Hood = {
    _definedComponents: {},
    _registeredInstances: {},
    _registryHeap: 100,
    internal: {
        registerInstance: function (instancePtr) {
            Hood._registryHeap += 1;
            instancePtr.__fd = Hood._registryHeap;
            Hood._registeredInstances[Hood._registryHeap] = instancePtr;
            return Hood._registryHeap;
        }
    }
};

// =================================
// Public APIs
// =================================

// Define component
Hood.define = function (componentClassName, componentDefinition) {
    Hood._definedComponents[componentClassName] = componentDefinition;
};

// Create component instance
Hood.create = function (componentClassName, src) {
    let _ni = {};
    // let _ni = new Hood.internal.createBabyInstance(componentClassName, src);
    _ni._src = src;
    _ni.render = Hood._definedComponents[componentClassName].render;
    _ni._rerender = function () {
        document.querySelector(`[hood-fd="${this.__fd}"]`).outerHTML = this.render();
    };
    // _ni.methods = {};
    Object.keys(Hood._definedComponents[componentClassName].methods).map(function (methodName) {
        _ni[methodName] = Hood._definedComponents[componentClassName].methods[methodName];
    });
    Hood.internal.registerInstance(_ni);
    return _ni;
};

// =================================
// Event Handling
// =================================
document.body.addEventListener('click', function (e) {
    let rawTarget = e.target;
    // console.log(`rawTarget`);
    // console.log(rawTarget);
    let rawOpts = {
        methodName: null,
        instanceFileDescriptor: null,
        targetPtr: e.target
    };
    let opts = (function (rawOpts) {
        let targetPtr = rawOpts.targetPtr;
        let methodName = null;
        let instanceFileDescriptor = null;
        for (var i = 0; i < 100; i++) {
            if (targetPtr.getAttribute('hood-method')) {
                methodName = targetPtr.getAttribute('hood-method');
            };
            if (targetPtr.getAttribute('hood-fd')) {
                instanceFileDescriptor = targetPtr.getAttribute('hood-fd');
            };
            if (instanceFileDescriptor && methodName) {
                console.log(`DEBUG: methodName: ${methodName}; fd: ${instanceFileDescriptor}`);
                return {
                    methodName: methodName,
                    instanceFileDescriptor: parseInt(instanceFileDescriptor),
                    targetPtr: targetPtr
                };
            } else {
                targetPtr = targetPtr.parentElement;
            };
            if (i === 99 || !targetPtr) {
                return { isFalsePositive: true };
            };
        };
    })(rawOpts);
    if (!opts.isFalsePositive) {
        let self = Hood._registeredInstances[opts.instanceFileDescriptor];
        Hood._registeredInstances[opts.instanceFileDescriptor][opts.methodName](self);
    } else {
        // e.preventDefault();
        // e.stopPropagation();
    };
});
