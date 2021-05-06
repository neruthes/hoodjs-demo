document.body.addEventListener('click', function (e) {
    let rawTarget = e.target;
    console.log(`rawTarget`);
    console.log(rawTarget);
    let targetPtr = e.target;
    let methodName = 'clickEvent';
    let componentUuid = null;
    for (var i = 0; i < 100; i++) {
        if (i === 99) {
            console.error(`Too many attempts.`);
            break;
        };
        if (targetPtr.getAttribute('ce-method')) {
            methodName = targetPtr.getAttribute('ce-method');
        };
        if (targetPtr.getAttribute('ce-uuid')) {
            componentUuid = targetPtr.getAttribute('ce-uuid');
            break;
        } else {
            targetPtr = targetPtr.parentElement;
        };
    };
    ComponentInstanceRegistry[componentUuid][methodName]();
});
