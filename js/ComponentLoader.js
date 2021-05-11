const ComponentInstanceRegistry = {};
const GlobalComponents = {};
const GlobalComponents_heapptr = 10;
const RegisterComponentInstance = function (componentPtr) {
    GlobalComponents_heapptr += 1;
    componentPtr.argv.uuid = GlobalComponents_heapptr;
    ComponentInstanceRegistry[GlobalComponents_heapptr] = componentPtr;
};

// const ComponentLoader = {};
// ComponentLoader.load = function (componentName) {
//     let tag = document.createElement('script');
//     tag.src = `/components/${componentName}.js`;
//     document.head.appendChild(tag);
// };
