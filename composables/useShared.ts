import WebGL from 'three/addons/capabilities/WebGL.js'


export default function useShared() {

    // 类型判断方法
    enum typeEnum {
        'Null'='Null',
        'Undefined'='Undefined',
        'Object'='Object',
        'Array'='Array',
        'String'='String',
        'Number'='Number',
        'Boolean'='Boolean',
        'Function'='Function',
        'RegExp'='RegExp',
        'Symbol'='Symbol',
        'BigInt'='BigInt',
    }
    const typeCheck: { [k in `is${typeEnum}`]: (o: any) => boolean} = {} as any;
    for(const t in Object.keys(typeEnum)) {
        (typeCheck as any)[`is${t}`] = (o: any) => Object.prototype.toString.call(o) === t
    }





    // webgl
    function isWebGL2Available(): [boolean, HTMLElement|null] {
        if(WebGL.isWebGL2Available()) {
            return [true, null]
        } else {
            return [false, WebGL.getWebGL2ErrorMessage()]
        }
    }


    return {
        ...typeCheck,
        isWebGL2Available,
    }
}