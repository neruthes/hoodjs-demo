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
                // if (attrList.filter(x => resultObj_foundFlag[x]).length === attrList.length) {
                    // return resultObj;
                // };
                if (targetPtr.parentElement) {
                    // console.log(`Attempt ${i} did not match enough`);
                    targetPtr = targetPtr.parentElement;
                } else {
                    return resultObj;
                };
            };
            console.error(`[ERROR] Exhausted all 99 attempts when searching attributes.`);
            resultObj.isFalsePositive = true;
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
    let theFunction = Hood._registeredInstances[fd][methodName];
    if (theFunction) {
        return theFunction.call(Hood._registeredInstances[fd], argv);
    } else {
        return undefined;
    };
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
    return Hood._registeredInstances[fd]._src[dataKey];
};
Hood.setSrcData = function (fd, dataKey, newValue) {
    Hood._registeredInstances[fd]._src[dataKey] = newValue;
};

// =================================
// Event Handling
// =================================
Hood.internal.generateRawEventHandler = function (evName) {
    return function (e) {
        let rawTarget = e.target;
        let searchQuery = Hood.internal.searchUpRecursively(rawTarget, ['hood-ev']);
        if (searchQuery.isFalsePositive || searchQuery['hood-ev'] === null) {
            console.log(`False positive click!`);
        } else {
            // Can find someone with 'hood-ev' attribute in the parent chain of rawTarget
            if (searchQuery['hood-ev'].split(' ').indexOf(evName) !== -1) {
                // The 'evName' event should be listened
                // Find fd recursively and call its 'on_${evName}' method
                let resultObj = Hood.internal.searchUpRecursively(rawTarget, ['hood-fd']);
                Hood.call(parseInt(resultObj['hood-fd']), `on_${evName}`, {
                    ev: e
                });
            };
        };
    };
};
document.body.addEventListener('input', Hood.internal.generateRawEventHandler('input'));
document.body.addEventListener('click', Hood.internal.generateRawEventHandler('click'));
// NOTE: Focus & Blur cannot be bubbled so they are captured in other ways
