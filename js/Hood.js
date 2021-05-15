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
        },
        searchUpRecursively: function (target, attrList) {
            // target <HTMLElement>: Search since which element
            // attrList <Array>: List of attributes
            let resultObj = {};
            let resultObj_foundFlag = {};
            let targetPtr = target;
            attrList.map(function (attr) {
                resultObj[attr] = null;
                resultObj_foundFlag[attr] = false;
            });
            for (let i = 0; i < 99; i++) {
                attrList.map(function (attr) {
                    if (resultObj_foundFlag[attr] === false && targetPtr.getAttribute(attr)) {
                        resultObj[attr] = targetPtr.getAttribute(attr);
                        resultObj_foundFlag[attr] = true;
                    };
                });
                if (targetPtr.parentElement) {
                    console.log(`Attempt ${i} did not match enough`);
                    targetPtr = targetPtr.parentElement;
                } else {
                    return resultObj;
                };
            };
            console.error(`[ERROR] Exhausted all 99 attempts when searching attributes.`);
            return resultObj;
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
    let _ni = {
        _src: src, // bind data
        _states: {}, // local states
        _spawnedChildren: new Set()
    };
    _ni._src = src;
    _ni.init = Hood._definedComponents[componentClassName].init;
    _ni.render = Hood._definedComponents[componentClassName].render;
    _ni._rerender = function () {
        document.querySelector(`[hood-fd="${this.__fd}"]`).outerHTML = this.render();
    };
    Object.keys(Hood._definedComponents[componentClassName].methods).map(function (methodName) {
        _ni[methodName] = Hood._definedComponents[componentClassName].methods[methodName];
    });
    Hood.internal.registerInstance(_ni);
    _ni.init();
    return _ni;
};

// Destroy component instance
Hood.gc = function (fd) {
    if (Hood._registeredInstances[fd]._spawnedChildren.size > 0) {
        Hood._registeredInstances[fd]._spawnedChildren.forEach(function (childFd) {
            Hood.gc(childFd);
        });
    };
    Hood._registeredInstances[fd] = null;
};

// Create, and set owner
Hood.spawn = function (componentClassName, src, ownerFd) {
    let ni = Hood.create(componentClassName, src);
    // Register ownership data bidirectionally
    ni._ownerFd = ownerFd;
    Hood._registeredInstances[ownerFd]._spawnedChildren.add(ni.__fd);
    return ni;
};

// Rebind new data to existing instance
Hood.rebind = function (fd, src, options) {
    Hood._registeredInstances[fd]._src = src;
    if (options) {
        if (options.reinit) {
            Hood.call(fd, 'init');
        };
    };
};

// Call method of instance by fd and methodName
Hood.call = function (fd, methodName, argv) {
    return Hood._registeredInstances[fd][methodName](argv);
};

// Get and set state of instance by fd and stateName
Hood.getState = function (fd, stateName) {
    return Hood._registeredInstances[fd]._states[stateName];
};
Hood.setState = function (fd, stateName, newValue) {
    Hood._registeredInstances[fd]._states[stateName] = newValue;
};

// Get and set state of instance by fd and dataKey
Hood.getSrcData = function (fd, dataKey) {
    console.log(`Hood.getSrcData fd=${fd} dataKey=${dataKey}`);
    return Hood._registeredInstances[fd]._src[dataKey];
};
Hood.setSrcData = function (fd, dataKey, newValue) {
    Hood._registeredInstances[fd]._src[dataKey] = newValue;
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
                // console.log(`DEBUG: methodName: ${methodName}; fd: ${instanceFileDescriptor}`);
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
        // let self = Hood._registeredInstances[opts.instanceFileDescriptor];
        console.log(`raw click event capture`);
        console.log(`opts.methodName ${opts.methodName}`);
        console.log(e);
        Hood._registeredInstances[opts.instanceFileDescriptor][opts.methodName]({
            ev: e
        });
    } else {
        // e.preventDefault();
        // e.stopPropagation();
    };
});

document.body.addEventListener('input', function (e) {
    let rawTarget = e.target;
    console.log(`rawTarget`);
    console.log(rawTarget);
    if (rawTarget.getAttribute('hood-ev').split(' ').indexOf('input') !== -1) {
        // The input event should be listened
        // Find fd recursively and call its on_input method
        let resultObj = Hood.internal.searchUpRecursively(rawTarget, ['hood-fd']);
        console.log('resultObj');
        console.log(resultObj);
        Hood.call(parseInt(resultObj['hood-fd']), 'on_input', {
            ev: e
        });
    };
});

