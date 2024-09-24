import { mat4 } from "gl-matrix";

export interface ProgramInfo {
    program: WebGLProgram;
    attribLocations: {
      vertexPosition: number;
      vertexColor: number;
    };
    uniformLocations: any;
}

export interface Buffers {
    position: WebGLBuffer;
    indices: WebGLBuffer;
    color: WebGLBuffer;
}


export default function useWebGL() {
    let _canvas: HTMLCanvasElement|null
    let gl: WebGL2RenderingContext
    let shaderProgram: WebGLProgram
    // const { isString } = useShared()

    let buffers: Buffers
    let programInfo: ProgramInfo

    let totalPoint: number

    // attr
    let modelMatrix = mat4.create();
    let rotateMatrix = mat4.create();
    let scaleSize = 1;
    let radians = 0;
    let change = -0.01;

    /**
     * 获取canvas webgl2 context
     * @param dom 
     * @returns 
     */
    const getWebGLContext = (dom: HTMLCanvasElement | string) =>  {
        if(!dom) {
            throw new Error('please input a dom')
        }
        if(typeof dom === 'string') {
            _canvas = document.querySelector<HTMLCanvasElement>(dom)
            if(_canvas?.nodeName !== 'CANVAS')
                throw new Error(`${dom} n\'t a canvas element, select again please`)
        } else {
            _canvas = dom
        }

        gl = _canvas.getContext('webgl2')!
        if (!gl) {
            throw new Error('Unable to initialize WebGL. Your browser or machine may not support it.');
        }

        return instance
    }

    /**
     * creates a shader of the given type, uploads the source and compiles it.
     * 创建一个指定类型的着色器，加载程序并编译
     * @returns WebGLShader
     */
    function loadShader(type: GLenum, source: string): WebGLShader {
        const shader = gl.createShader(type);

        if(!shader) {
            throw new Error(`type ${type} shader create fault`)
        }
    
        // Send the source to the shader object
        gl.shaderSource(shader, source);
    
        // Compile the shader program
        gl.compileShader(shader);
    
        // See if it compiled successfully
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            gl.deleteShader(shader);
            throw new Error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        }
    
        return shader;
    }

    /**
     * Initialize a shader program, so WebGL knows how to draw our data
     */

    function initShaderProgram(vsSource: string, fsSource: string) {

        const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
    
        // Create the shader program
    
        shaderProgram = gl.createProgram()!;
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
    
        // If creating the shader program failed, alert
    
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            throw new Error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        }

        programInfo = {
            program: shaderProgram,
            attribLocations: {
              vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
              vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
            },
            uniformLocations: {
              rotateMatrix: gl.getUniformLocation(shaderProgram, 'uRotateMatrix4'),
              modelMatrix: gl.getUniformLocation(shaderProgram, 'uModelMatrix4'),
              // modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
            },
          };
    
        return instance;
    }

    function setViewport(x: GLint, y: GLint, w: GLsizei, h: GLsizei) {
        gl.viewport(x, y, w, h)
        return instance
    }

    /**
     * 初始化缓冲区
     * @param gl
     * @returns
     */
    function initBuffers(modelData: { vertex: number[], index: number[] }) {
        // 创建顶点缓冲区
        const positionBuffer = gl.createBuffer()!;
    
        // 讲顶点缓冲区绑定为数组类型
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
        // 获取顶点数据
        const {vertex: positions, index: indices} = modelData

        // Now pass the list of positions into WebGL to build the
        // shape. We do this by creating a Float32Array from the
        // JavaScript array, then use it to fill the current buffer.
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    
        // colors
        const faceColors = [
            [1.0, 1.0, 1.0, 0.5], // Front face: white
            [1.0, 0.0, 0.0, 0.6], // Back face: red
            [0.0, 1.0, 0.0, 1.0], // Top face: green
            [0.0, 0.0, 1.0, 1.0], // Bottom face: blue
            [1.0, 1.0, 0.0, 1.0], // Right face: yellow
            [1.0, 0.0, 1.0, 1.0], // Left face: purple
        ];
    
        // Convert the array of colors into a table for all the vertices.
        // TODO: 暂定为一种色
        var colors = [1.0, 1.0, 1.0, 1.0];
    
        const colorBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    
        // 索引缓冲区
        const indexBuffer = gl.createBuffer();
    
        // 指定缓冲区类型
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    
        buffers = {
            position: positionBuffer,
            color: colorBuffer,
            indices: indexBuffer!,
        };

        totalPoint = indices.length

        return instance
    }



    function render(cb: () => void = () => {}) {
        const _loop = () => {
            cb()
            if (scaleSize > 1) change = -0.002;
            else if (scaleSize < 0.45) change = 0.002;
            modelMatrix = mat4.create();
            // scaleSize += change;

            // radians += Math.PI / 720;

            mat4.rotateY(modelMatrix, modelMatrix, radians);
            mat4.scale(modelMatrix, modelMatrix, [scaleSize, scaleSize, scaleSize]);
            draw()
            requestAnimationFrame(_loop)
        }
        _loop()
    }

    function draw() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
        gl.clearDepth(1.0); // Clear everything
        gl.enable(gl.DEPTH_TEST); // Enable depth testing
        gl.depthFunc(gl.LEQUAL); // Near things obscure far things

        // Clear the canvas before we start drawing on it.

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Create a perspective matrix, a special matrix that is
        // used to simulate the distortion of perspective in a camera.
        // Our field of view is 45 degrees, with a width/height
        // ratio that matches the display size of the canvas
        // and we only want to see objects between 0.1 units
        // and 100 units away from the camera.

        {
            const numComponents = 3;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexPosition,
                numComponents,
                type,
                normalize,
                stride,
                offset
            );
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
        }

        // Tell WebGL how to pull out the colors from the color buffer
        // into the vertexColor attribute.
        {
            const numComponents = 4;
            const type = gl.FLOAT;
            const normalize = false;
            const stride = 0;
            const offset = 0;
            gl.bindBuffer(gl.ARRAY_BUFFER, buffers.color);
            gl.vertexAttribPointer(
                programInfo.attribLocations.vertexColor,
                numComponents,
                type,
                normalize,
                stride,
                offset
            );
            gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);
        }

        // Tell WebGL which indices to use to index the vertices
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

        // Tell WebGL to use our program when drawing

        gl.useProgram(programInfo.program);

        // const fieldOfView = 45 * Math.PI / 180;   // in radians
        // const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        // const zNear = 0.1;
        // const zFar = 100.0;
        // const projectionMatrix = mat4.create();

        // // note: glmatrix.js always has the first argument
        // // as the destination to receive the result.
        // mat4.perspective(projectionMatrix,
        //                  fieldOfView,
        //                  aspect,
        //                  zNear,
        //                  zFar);

        gl.uniformMatrix4fv(programInfo.uniformLocations.rotateMatrix, false, rotateMatrix);

        gl.uniformMatrix4fv(programInfo.uniformLocations.modelMatrix, false, modelMatrix);

            // Set the shader uniforms
        {
            const vertexCount = totalPoint;
            const type = gl.UNSIGNED_SHORT;
            const offset = 0;
            const drawMode = gl.TRIANGLE_STRIP // gl.TRIANGLE_FAN
            gl.drawElements(drawMode, vertexCount, type, offset);
        }
    }





    const instance = {
        getWebGLContext,
        initShaderProgram,
        setViewport,

        initBuffers,
        render,
    }

    return instance
}
