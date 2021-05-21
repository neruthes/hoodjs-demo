// =================================
// Basic
// =================================

const Hood = {
    _definedComponents: new Map(),
    _registeredInstances: new Map(),
    _namedInstances: new Map(),
    _registryHeap: 100,
    env: new Map(),
    internal: new Map(),
    instanceMethod: new Map()
};
Hood.internal.registerInstance = function (instancePtr) {
    Hood._registryHeap += 1;
    instancePtr.__fd = Hood._registryHeap;
    Hood._registeredInstances[Hood._registryHeap] = instancePtr;
    return Hood._registryHeap;
};
Hood.internal.searchUpRecursively = function (target, attrList) {
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
            // console.log(`Attempt ${i} did not match enough`);
            targetPtr = targetPtr.parentElement;
        } else {
            return resultObj;
        };
    };
    console.error(`[ERROR] Exhausted all 99 attempts when searching attributes.`);
    resultObj.isFalsePositive = true;
    return resultObj;
};
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
                if (isNaN(parseInt(resultObj['hood-fd']))) {
                    console.error(`[ERROR] Found hood-fd but it is not a valid integer.`);
                    return 1;
                };
                Hood.call(parseInt(resultObj['hood-fd']), `on_${evName}`, {
                    ev: e
                });
            };
        };
    };
};
Hood.internal.getRealFd = function (inputFd) {
    if (typeof inputFd === 'number') {
        return inputFd;
    } else {
        return Hood._namedInstances[inputFd];
    };
};
Hood.internal.realRender = function (rawRender) {
    return rawRender;
};
Hood.instanceMethod.rerender = function (argv) {
    document.querySelector(`[hood-fd="${this.__fd}"]`).outerHTML = this.render();
};
// Define component
Hood.define = function (componentClassName, componentDefinition) {
    Hood._definedComponents[componentClassName] = componentDefinition;
};

// Create component instance
Hood.create = function (componentClassName, src) {
    if (Hood._definedComponents[componentClassName].onceOnly) {
        console.error(`[ERROR] Class can only be used with renderOnce.`);
        return 1;
    };
    let _ni = {
        _src: src, // bind data
        _states: {}, // local states
        _spawnedChildren: new Set()
    };
    _ni._src = src;
    _ni.init = Hood._definedComponents[componentClassName].init;
    _ni.raw_render = Hood._definedComponents[componentClassName].render;
    _ni.render = function () {
        return Hood.internal.realRender(_ni.raw_render());
    };
    _ni._rerender = Hood.instanceMethod.rerender;
    Object.keys(Hood._definedComponents[componentClassName].methods).map(function (methodName) {
        _ni[methodName] = Hood._definedComponents[componentClassName].methods[methodName];
    });
    Hood.internal.registerInstance(_ni);
    if (Hood._definedComponents[componentClassName].name) { // Created a named instance
        Hood._namedInstances[Hood._definedComponents[componentClassName].name] = _ni.__fd;
    };
    _ni.init();
    return _ni;
};

// Render once only
Hood.renderOnce = function (componentClassName, src) {
    if (!Hood._definedComponents[componentClassName].onceOnly) {
        console.error(`[ERROR] Class does not support renderOnce.`);
        return 1;
    };
    let _ni = {};
    _ni._src = src;
    if (Hood._definedComponents[componentClassName].init) {
        Hood._definedComponents[componentClassName].init.call(_ni, {});
    };
    return Hood._definedComponents[componentClassName].render.call(_ni, {});
};

// Destroy component instance
Hood.gc = function (fd) {
    let realFd = Hood.internal.getRealFd(fd);
    if (Hood._registeredInstances[realFd]._spawnedChildren.size > 0) {
        Hood._registeredInstances[realFd]._spawnedChildren.forEach(function (childFd) {
            Hood.gc(childFd);
        });
    };
    Hood._registeredInstances[realFd] = null;
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
    let realFd = Hood.internal.getRealFd(fd);
    Hood._registeredInstances[realFd]._src = src;
    if (options) {
        if (options.reinit) {
            Hood.call(realFd, 'init');
        };
    };
};

// Call method of instance by fd and methodName
Hood.call = function (fd, methodName, argv) {
    let realFd = Hood.internal.getRealFd(fd);
    let theFunction = Hood._registeredInstances[realFd][methodName];
    if (theFunction) {
        return theFunction.call(Hood._registeredInstances[realFd], argv);
    } else {
        return undefined;
    };
};

// Get and set state of instance by fd and stateName
Hood.getState = function (fd, stateName) {
    let realFd = Hood.internal.getRealFd(fd);
    return Hood._registeredInstances[realFd]._states[stateName];
};
Hood.setState = function (fd, stateName, newValue) {
    let realFd = Hood.internal.getRealFd(fd);
    Hood._registeredInstances[realFd]._states[stateName] = newValue;
};

// Get and set source data of instance by fd and dataKey
Hood.getSrcData = function (fd, dataKey) {
    let realFd = Hood.internal.getRealFd(fd);
    return Hood._registeredInstances[realFd]._src[dataKey];
};
Hood.setSrcData = function (fd, dataKey, newValue) {
    let realFd = Hood.internal.getRealFd(fd);
    Hood._registeredInstances[realFd]._src[dataKey] = newValue;
};
document.body.addEventListener('input', Hood.internal.generateRawEventHandler('input'));

// NOTE: Click events should be handled by each DOM element, which declares a method name for the click event
document.body.addEventListener('click', function (e) {
    let rawTarget = e.target;
    let searchQuery = Hood.internal.searchUpRecursively(rawTarget, ['hood-fd', 'hood-click']);
    if (searchQuery['hood-fd'] === null || searchQuery['hood-click'] === null) {
        console.log(`False positive click!`);
    } else {
        let fd = searchQuery['hood-fd'];
        let methodName = searchQuery['hood-click'];
        Hood.call(parseInt(fd), methodName);
    };
});

// NOTE: Focus & Blur cannot be bubbled so they are captured in other ways
