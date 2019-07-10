
let wasm;

/**
* @returns {void}
*/
export function wasm_main() {
    return wasm.wasm_main();
}

const heap = new Array(32);

heap.fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

function getObject(idx) { return heap[idx]; }

let WASM_VECTOR_LEN = 0;

let cachedTextEncoder = new TextEncoder('utf-8');

let cachegetUint8Memory = null;
function getUint8Memory() {
    if (cachegetUint8Memory === null || cachegetUint8Memory.buffer !== wasm.memory.buffer) {
        cachegetUint8Memory = new Uint8Array(wasm.memory.buffer);
    }
    return cachegetUint8Memory;
}

let passStringToWasm;
if (typeof cachedTextEncoder.encodeInto === 'function') {
    passStringToWasm = function(arg) {


        let size = arg.length;
        let ptr = wasm.__wbindgen_malloc(size);
        let offset = 0;
        {
            const mem = getUint8Memory();
            for (; offset < arg.length; offset++) {
                const code = arg.charCodeAt(offset);
                if (code > 0x7F) break;
                mem[ptr + offset] = code;
            }
        }

        if (offset !== arg.length) {
            arg = arg.slice(offset);
            ptr = wasm.__wbindgen_realloc(ptr, size, size = offset + arg.length * 3);
            const view = getUint8Memory().subarray(ptr + offset, ptr + size);
            const ret = cachedTextEncoder.encodeInto(arg, view);

            offset += ret.written;
        }
        WASM_VECTOR_LEN = offset;
        return ptr;
    };
} else {
    passStringToWasm = function(arg) {


        let size = arg.length;
        let ptr = wasm.__wbindgen_malloc(size);
        let offset = 0;
        {
            const mem = getUint8Memory();
            for (; offset < arg.length; offset++) {
                const code = arg.charCodeAt(offset);
                if (code > 0x7F) break;
                mem[ptr + offset] = code;
            }
        }

        if (offset !== arg.length) {
            const buf = cachedTextEncoder.encode(arg.slice(offset));
            ptr = wasm.__wbindgen_realloc(ptr, size, size = offset + buf.length);
            getUint8Memory().set(buf, ptr + offset);
            offset += buf.length;
        }
        WASM_VECTOR_LEN = offset;
        return ptr;
    };
}

let cachegetUint32Memory = null;
function getUint32Memory() {
    if (cachegetUint32Memory === null || cachegetUint32Memory.buffer !== wasm.memory.buffer) {
        cachegetUint32Memory = new Uint32Array(wasm.memory.buffer);
    }
    return cachegetUint32Memory;
}

let cachedTextDecoder = new TextDecoder('utf-8');

function getStringFromWasm(ptr, len) {
    return cachedTextDecoder.decode(getUint8Memory().subarray(ptr, ptr + len));
}

function dropObject(idx) {
    if (idx < 36) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function handleError(e) {
    wasm.__wbindgen_exn_store(addHeapObject(e));
}

function isLikeNone(x) {
    return x === undefined || x === null;
}

function getArrayU8FromWasm(ptr, len) {
    return getUint8Memory().subarray(ptr / 1, ptr / 1 + len);
}

let cachegetFloat32Memory = null;
function getFloat32Memory() {
    if (cachegetFloat32Memory === null || cachegetFloat32Memory.buffer !== wasm.memory.buffer) {
        cachegetFloat32Memory = new Float32Array(wasm.memory.buffer);
    }
    return cachegetFloat32Memory;
}

function getArrayF32FromWasm(ptr, len) {
    return getFloat32Memory().subarray(ptr / 4, ptr / 4 + len);
}

function getArrayU32FromWasm(ptr, len) {
    return getUint32Memory().subarray(ptr / 4, ptr / 4 + len);
}

let cachegetInt32Memory = null;
function getInt32Memory() {
    if (cachegetInt32Memory === null || cachegetInt32Memory.buffer !== wasm.memory.buffer) {
        cachegetInt32Memory = new Int32Array(wasm.memory.buffer);
    }
    return cachegetInt32Memory;
}

function getArrayI32FromWasm(ptr, len) {
    return getInt32Memory().subarray(ptr / 4, ptr / 4 + len);
}

function debugString(val) {
    // primitive types
    const type = typeof val;
    if (type == 'number' || type == 'boolean' || val == null) {
        return  `${val}`;
    }
    if (type == 'string') {
        return `"${val}"`;
    }
    if (type == 'symbol') {
        const description = val.description;
        if (description == null) {
            return 'Symbol';
        } else {
            return `Symbol(${description})`;
        }
    }
    if (type == 'function') {
        const name = val.name;
        if (typeof name == 'string' && name.length > 0) {
            return `Function(${name})`;
        } else {
            return 'Function';
        }
    }
    // objects
    if (Array.isArray(val)) {
        const length = val.length;
        let debug = '[';
        if (length > 0) {
            debug += debugString(val[0]);
        }
        for(let i = 1; i < length; i++) {
            debug += ', ' + debugString(val[i]);
        }
        debug += ']';
        return debug;
    }
    // Test for built-in
    const builtInMatches = /\[object ([^\]]+)\]/.exec(toString.call(val));
    let className;
    if (builtInMatches.length > 1) {
        className = builtInMatches[1];
    } else {
        // Failed to match the standard '[object ClassName]'
        return toString.call(val);
    }
    if (className == 'Object') {
        // we're a user defined class or Object
        // JSON.stringify avoids problems with cycles, and is generally much
        // easier than looping through ownProperties of `val`.
        try {
            return 'Object(' + JSON.stringify(val) + ')';
        } catch (_) {
            return 'Object';
        }
    }
    // errors
    if (val instanceof Error) {
        return `${val.name}: ${val.message}\n${val.stack}`;
    }
    // TODO we could test for more things here, like `Set`s and `Map`s.
    return className;
}

function init(module) {
    if (typeof module === 'undefined') {
        module = import.meta.url.replace(/\.js$/, '_bg.wasm');
    }
    let result;
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_new_59cb74e423758ede = function() {
        return addHeapObject(new Error());
    };
    imports.wbg.__wbg_stack_558ba5917b466edd = function(ret, arg0) {

        const retptr = passStringToWasm(getObject(arg0).stack);
        const retlen = WASM_VECTOR_LEN;
        const mem = getUint32Memory();
        mem[ret / 4] = retptr;
        mem[ret / 4 + 1] = retlen;

    };
    imports.wbg.__wbg_error_4bb6c2a97407129a = function(arg0, arg1) {
        let varg0 = getStringFromWasm(arg0, arg1);

        varg0 = varg0.slice();
        wasm.__wbindgen_free(arg0, arg1 * 1);

        console.error(varg0);
    };
    imports.wbg.__wbindgen_object_drop_ref = function(arg0) {
        takeObject(arg0);
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        let varg0 = getStringFromWasm(arg0, arg1);
        return addHeapObject(varg0);
    };
    imports.wbg.__widl_f_framebuffer_renderbuffer_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).framebufferRenderbuffer(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4));
    };
    imports.wbg.__widl_f_bind_texture_WebGLRenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__widl_f_bind_texture_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).bindTexture(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__widl_f_framebuffer_texture_2d_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
    };
    imports.wbg.__widl_f_framebuffer_texture_2d_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).framebufferTexture2D(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, getObject(arg4), arg5);
    };
    imports.wbg.__widl_f_framebuffer_texture_layer_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).framebufferTextureLayer(arg1 >>> 0, arg2 >>> 0, getObject(arg3), arg4, arg5);
    };
    imports.wbg.__wbg_get_f6922348004f9279 = function(arg0, arg1) {
        try {
            return addHeapObject(Reflect.get(getObject(arg0), getObject(arg1)));
        } catch (e) {
            handleError(e);
        }
    };
    imports.wbg.__wbg_malloc_3054461327ef1cd2 = function(arg0) {
        return sc_internal._malloc(arg0 >>> 0);
    };
    imports.wbg.__wbg_scinternalcompilerglslnew_ebaf33d63e855a69 = function(arg0, arg1, arg2) {
        return sc_internal._sc_internal_compiler_glsl_new(arg0 >>> 0, arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_free_3e0dba5e27773831 = function(arg0) {
        sc_internal._free(arg0 >>> 0);
    };
    imports.wbg.__wbg_scinternalcompilergetspecializationconstants_4ce93a90a1b5441e = function(arg0, arg1, arg2) {
        return sc_internal._sc_internal_compiler_get_specialization_constants(arg0 >>> 0, arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_scinternalfreepointer_256176d8fc7f99ce = function(arg0) {
        return sc_internal._sc_internal_free_pointer(arg0 >>> 0);
    };
    imports.wbg.__wbg_scinternalcompilerglslbuildcombinedimagesamplers_f78271f5306e5540 = function(arg0) {
        return sc_internal._sc_internal_compiler_glsl_build_combined_image_samplers(arg0 >>> 0);
    };
    imports.wbg.__wbg_scinternalcompilerglslgetcombinedimagesamplers_4854bf1fe21ba51a = function(arg0, arg1, arg2) {
        return sc_internal._sc_internal_compiler_glsl_get_combined_image_samplers(arg0 >>> 0, arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_scinternalcompilersetscalarconstant_c1ea6cc72e0bb639 = function(arg0, arg1, arg2, arg3) {
        return sc_internal._sc_internal_compiler_set_scalar_constant(arg0 >>> 0, arg1 >>> 0, arg2 >>> 0, arg3 >>> 0);
    };
    imports.wbg.__wbindgen_number_new = function(arg0) {
        return addHeapObject(arg0);
    };
    imports.wbg.__wbindgen_number_get = function(arg0, arg1) {
        const obj = getObject(arg0);
        if (typeof(obj) === 'number') return obj;
        getUint8Memory()[arg1] = 1;
        return 0;
    };
    imports.wbg.__wbg_scinternalcompilersetname_ae6d58fb9b506cd0 = function(arg0, arg1, arg2) {
        return sc_internal._sc_internal_compiler_set_name(arg0 >>> 0, arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_scinternalcompilerunsetdecoration_7f434017ea7955fd = function(arg0, arg1, arg2) {
        return sc_internal._sc_internal_compiler_unset_decoration(arg0 >>> 0, arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__wbg_scinternalcompilersetdecoration_26092048efe957a0 = function(arg0, arg1, arg2, arg3) {
        return sc_internal._sc_internal_compiler_set_decoration(arg0 >>> 0, arg1 >>> 0, arg2 >>> 0, arg3 >>> 0);
    };
    imports.wbg.__wbg_scinternalcompilerglslsetoptions_0e7f4ec1e7338dce = function(arg0, arg1) {
        return sc_internal._sc_internal_compiler_glsl_set_options(arg0 >>> 0, arg1 >>> 0);
    };
    imports.wbg.__wbg_scinternalcompilercompile_a33e06d41e9b0418 = function(arg0, arg1) {
        return sc_internal._sc_internal_compiler_compile(arg0 >>> 0, arg1 >>> 0);
    };
    imports.wbg.__widl_f_create_shader_WebGL2RenderingContext = function(arg0, arg1) {

        const val = getObject(arg0).createShader(arg1 >>> 0);
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_create_shader_WebGLRenderingContext = function(arg0, arg1) {

        const val = getObject(arg0).createShader(arg1 >>> 0);
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_shader_source_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        let varg2 = getStringFromWasm(arg2, arg3);
        getObject(arg0).shaderSource(getObject(arg1), varg2);
    };
    imports.wbg.__widl_f_shader_source_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        let varg2 = getStringFromWasm(arg2, arg3);
        getObject(arg0).shaderSource(getObject(arg1), varg2);
    };
    imports.wbg.__widl_f_compile_shader_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).compileShader(getObject(arg1));
    };
    imports.wbg.__widl_f_compile_shader_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).compileShader(getObject(arg1));
    };
    imports.wbg.__widl_f_get_shader_parameter_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        return addHeapObject(getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0));
    };
    imports.wbg.__widl_f_get_shader_parameter_WebGLRenderingContext = function(arg0, arg1, arg2) {
        return addHeapObject(getObject(arg0).getShaderParameter(getObject(arg1), arg2 >>> 0));
    };
    imports.wbg.__wbindgen_boolean_get = function(arg0) {
        const v = getObject(arg0);
        return typeof(v) === 'boolean' ? (v ? 1 : 0) : 2;
    };
    imports.wbg.__widl_f_get_shader_info_log_WebGL2RenderingContext = function(ret, arg0, arg1) {
        const val = getObject(arg0).getShaderInfoLog(getObject(arg1));
        const retptr = isLikeNone(val) ? [0, 0] : passStringToWasm(val);
        const retlen = WASM_VECTOR_LEN;
        const mem = getUint32Memory();
        mem[ret / 4] = retptr;
        mem[ret / 4 + 1] = retlen;

    };
    imports.wbg.__widl_f_get_shader_info_log_WebGLRenderingContext = function(ret, arg0, arg1) {
        const val = getObject(arg0).getShaderInfoLog(getObject(arg1));
        const retptr = isLikeNone(val) ? [0, 0] : passStringToWasm(val);
        const retlen = WASM_VECTOR_LEN;
        const mem = getUint32Memory();
        mem[ret / 4] = retptr;
        mem[ret / 4 + 1] = retlen;

    };
    imports.wbg.__wbg_scinternalcompilerdelete_22999912e1bafe3a = function(arg0) {
        return sc_internal._sc_internal_compiler_delete(arg0 >>> 0);
    };
    imports.wbg.__widl_f_create_buffer_WebGL2RenderingContext = function(arg0) {

        const val = getObject(arg0).createBuffer();
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_create_buffer_WebGLRenderingContext = function(arg0) {

        const val = getObject(arg0).createBuffer();
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_bind_buffer_WebGLRenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__widl_f_bind_buffer_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).bindBuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__widl_f_buffer_data_with_i32_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, arg2, arg3 >>> 0);
    };
    imports.wbg.__widl_f_buffer_data_with_i32_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).bufferData(arg1 >>> 0, arg2, arg3 >>> 0);
    };
    imports.wbg.__widl_f_create_program_WebGL2RenderingContext = function(arg0) {

        const val = getObject(arg0).createProgram();
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_create_program_WebGLRenderingContext = function(arg0) {

        const val = getObject(arg0).createProgram();
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_link_program_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).linkProgram(getObject(arg1));
    };
    imports.wbg.__widl_f_link_program_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).linkProgram(getObject(arg1));
    };
    imports.wbg.__widl_f_detach_shader_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).detachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__widl_f_detach_shader_WebGLRenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).detachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__widl_f_delete_shader_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).deleteShader(getObject(arg1));
    };
    imports.wbg.__widl_f_delete_shader_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).deleteShader(getObject(arg1));
    };
    imports.wbg.__widl_f_use_program_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).useProgram(getObject(arg1));
    };
    imports.wbg.__widl_f_use_program_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).useProgram(getObject(arg1));
    };
    imports.wbg.__widl_f_get_program_parameter_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        return addHeapObject(getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0));
    };
    imports.wbg.__widl_f_get_program_parameter_WebGLRenderingContext = function(arg0, arg1, arg2) {
        return addHeapObject(getObject(arg0).getProgramParameter(getObject(arg1), arg2 >>> 0));
    };
    imports.wbg.__widl_f_get_program_info_log_WebGL2RenderingContext = function(ret, arg0, arg1) {
        const val = getObject(arg0).getProgramInfoLog(getObject(arg1));
        const retptr = isLikeNone(val) ? [0, 0] : passStringToWasm(val);
        const retlen = WASM_VECTOR_LEN;
        const mem = getUint32Memory();
        mem[ret / 4] = retptr;
        mem[ret / 4 + 1] = retlen;

    };
    imports.wbg.__widl_f_get_program_info_log_WebGLRenderingContext = function(ret, arg0, arg1) {
        const val = getObject(arg0).getProgramInfoLog(getObject(arg1));
        const retptr = isLikeNone(val) ? [0, 0] : passStringToWasm(val);
        const retlen = WASM_VECTOR_LEN;
        const mem = getUint32Memory();
        mem[ret / 4] = retptr;
        mem[ret / 4 + 1] = retlen;

    };
    imports.wbg.__widl_f_uniform1i_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1i(getObject(arg1), arg2);
    };
    imports.wbg.__widl_f_uniform1i_WebGLRenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1i(getObject(arg1), arg2);
    };
    imports.wbg.__widl_f_get_active_uniform_WebGL2RenderingContext = function(arg0, arg1, arg2) {

        const val = getObject(arg0).getActiveUniform(getObject(arg1), arg2 >>> 0);
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_size_WebGLActiveInfo = function(arg0) {
        return getObject(arg0).size;
    };
    imports.wbg.__widl_f_type_WebGLActiveInfo = function(arg0) {
        return getObject(arg0).type;
    };
    imports.wbg.__widl_f_name_WebGLActiveInfo = function(ret, arg0) {

        const retptr = passStringToWasm(getObject(arg0).name);
        const retlen = WASM_VECTOR_LEN;
        const mem = getUint32Memory();
        mem[ret / 4] = retptr;
        mem[ret / 4 + 1] = retlen;

    };
    imports.wbg.__widl_f_get_active_uniform_WebGLRenderingContext = function(arg0, arg1, arg2) {

        const val = getObject(arg0).getActiveUniform(getObject(arg1), arg2 >>> 0);
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_create_renderbuffer_WebGL2RenderingContext = function(arg0) {

        const val = getObject(arg0).createRenderbuffer();
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_create_texture_WebGL2RenderingContext = function(arg0) {

        const val = getObject(arg0).createTexture();
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_create_texture_WebGLRenderingContext = function(arg0) {

        const val = getObject(arg0).createTexture();
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_create_renderbuffer_WebGLRenderingContext = function(arg0) {

        const val = getObject(arg0).createRenderbuffer();
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_tex_storage_2d_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).texStorage2D(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    };
    imports.wbg.__widl_f_tex_parameteri_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
    };
    imports.wbg.__widl_f_tex_storage_3d_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).texStorage3D(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5, arg6);
    };
    imports.wbg.__widl_f_tex_parameteri_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).texParameteri(arg1 >>> 0, arg2 >>> 0, arg3);
    };
    imports.wbg.__widl_f_tex_image_3d_with_opt_u8_array_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
        let varg10 = arg10 == 0 ? undefined : getArrayU8FromWasm(arg10, arg11);
        try {
            getObject(arg0).texImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8 >>> 0, arg9 >>> 0, varg10);
        } catch (e) {
            handleError(e);
        }
    };
    imports.wbg.__widl_f_tex_image_2d_with_i32_and_i32_and_i32_and_format_and_type_and_opt_u8_array_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
        let varg9 = arg9 == 0 ? undefined : getArrayU8FromWasm(arg9, arg10);
        try {
            getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, varg9);
        } catch (e) {
            handleError(e);
        }
    };
    imports.wbg.__widl_f_tex_image_2d_with_i32_and_i32_and_i32_and_format_and_type_and_opt_u8_array_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
        let varg9 = arg9 == 0 ? undefined : getArrayU8FromWasm(arg9, arg10);
        try {
            getObject(arg0).texImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, varg9);
        } catch (e) {
            handleError(e);
        }
    };
    imports.wbg.__widl_f_bind_renderbuffer_WebGLRenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).bindRenderbuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__widl_f_bind_renderbuffer_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).bindRenderbuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__widl_f_renderbuffer_storage_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).renderbufferStorage(arg1 >>> 0, arg2 >>> 0, arg3, arg4);
    };
    imports.wbg.__widl_f_renderbuffer_storage_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).renderbufferStorage(arg1 >>> 0, arg2 >>> 0, arg3, arg4);
    };
    imports.wbg.__widl_f_flush_WebGL2RenderingContext = function(arg0) {
        getObject(arg0).flush();
    };
    imports.wbg.__widl_f_flush_WebGLRenderingContext = function(arg0) {
        getObject(arg0).flush();
    };
    imports.wbg.__widl_f_get_sync_parameter_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        return addHeapObject(getObject(arg0).getSyncParameter(getObject(arg1), arg2 >>> 0));
    };
    imports.wbg.__widl_f_delete_buffer_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).deleteBuffer(getObject(arg1));
    };
    imports.wbg.__widl_f_delete_buffer_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).deleteBuffer(getObject(arg1));
    };
    imports.wbg.__widl_f_delete_texture_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).deleteTexture(getObject(arg1));
    };
    imports.wbg.__widl_f_delete_renderbuffer_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).deleteRenderbuffer(getObject(arg1));
    };
    imports.wbg.__widl_f_delete_texture_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).deleteTexture(getObject(arg1));
    };
    imports.wbg.__widl_f_delete_renderbuffer_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).deleteRenderbuffer(getObject(arg1));
    };
    imports.wbg.__widl_f_delete_sampler_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).deleteSampler(getObject(arg1));
    };
    imports.wbg.__widl_f_delete_sync_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).deleteSync(getObject(arg1));
    };
    imports.wbg.__widl_f_finish_WebGL2RenderingContext = function(arg0) {
        getObject(arg0).finish();
    };
    imports.wbg.__widl_f_finish_WebGLRenderingContext = function(arg0) {
        getObject(arg0).finish();
    };
    imports.wbg.__widl_f_enable_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).enable(arg1 >>> 0);
    };
    imports.wbg.__widl_f_enable_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).enable(arg1 >>> 0);
    };
    imports.wbg.__widl_f_pixel_storei_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
    };
    imports.wbg.__widl_f_pixel_storei_WebGLRenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).pixelStorei(arg1 >>> 0, arg2);
    };
    imports.wbg.__widl_f_create_vertex_array_WebGL2RenderingContext = function(arg0) {

        const val = getObject(arg0).createVertexArray();
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_bind_vertex_array_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).bindVertexArray(getObject(arg1));
    };
    imports.wbg.__wbg_scinternalcompilergetshaderresources_42928120ef09d5f6 = function(arg0, arg1) {
        return sc_internal._sc_internal_compiler_get_shader_resources(arg0 >>> 0, arg1 >>> 0);
    };
    imports.wbg.__widl_f_viewport_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).viewport(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__widl_f_viewport_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).viewport(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__widl_f_depth_range_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).depthRange(arg1, arg2);
    };
    imports.wbg.__widl_f_depth_range_WebGLRenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).depthRange(arg1, arg2);
    };
    imports.wbg.__widl_f_scissor_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).scissor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__widl_f_scissor_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).scissor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__widl_f_draw_arrays_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__widl_f_bind_sampler_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).bindSampler(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__widl_f_active_texture_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).activeTexture(arg1 >>> 0);
    };
    imports.wbg.__widl_f_clear_bufferfv_with_f32_array_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        let varg3 = getArrayF32FromWasm(arg3, arg4);
        getObject(arg0).clearBufferfv(arg1 >>> 0, arg2, varg3);
    };
    imports.wbg.__widl_f_clear_bufferfi_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).clearBufferfi(arg1 >>> 0, arg2, arg3, arg4);
    };
    imports.wbg.__widl_f_disable_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).disable(arg1 >>> 0);
    };
    imports.wbg.__widl_f_clear_bufferuiv_with_u32_array_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        let varg3 = getArrayU32FromWasm(arg3, arg4);
        getObject(arg0).clearBufferuiv(arg1 >>> 0, arg2, varg3);
    };
    imports.wbg.__widl_f_blend_color_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).blendColor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__widl_f_front_face_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).frontFace(arg1 >>> 0);
    };
    imports.wbg.__widl_f_bind_buffer_range_with_i32_and_i32_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).bindBufferRange(arg1 >>> 0, arg2 >>> 0, getObject(arg3), arg4, arg5);
    };
    imports.wbg.__widl_f_clear_bufferiv_with_i32_array_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        let varg3 = getArrayI32FromWasm(arg3, arg4);
        getObject(arg0).clearBufferiv(arg1 >>> 0, arg2, varg3);
    };
    imports.wbg.__widl_f_active_texture_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).activeTexture(arg1 >>> 0);
    };
    imports.wbg.__widl_f_blend_color_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).blendColor(arg1, arg2, arg3, arg4);
    };
    imports.wbg.__widl_f_front_face_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).frontFace(arg1 >>> 0);
    };
    imports.wbg.__widl_f_cull_face_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).cullFace(arg1 >>> 0);
    };
    imports.wbg.__widl_f_cull_face_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).cullFace(arg1 >>> 0);
    };
    imports.wbg.__widl_f_disable_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).disable(arg1 >>> 0);
    };
    imports.wbg.__widl_f_depth_func_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).depthFunc(arg1 >>> 0);
    };
    imports.wbg.__widl_f_depth_func_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).depthFunc(arg1 >>> 0);
    };
    imports.wbg.__widl_f_depth_mask_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).depthMask(arg1 !== 0);
    };
    imports.wbg.__widl_f_depth_mask_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).depthMask(arg1 !== 0);
    };
    imports.wbg.__widl_f_draw_arrays_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).drawArrays(arg1 >>> 0, arg2, arg3);
    };
    imports.wbg.__widl_f_vertex_attrib_pointer_with_i32_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    };
    imports.wbg.__widl_f_vertex_attrib_i_pointer_with_i32_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).vertexAttribIPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    };
    imports.wbg.__widl_f_vertex_attrib_pointer_with_i32_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6) {
        getObject(arg0).vertexAttribPointer(arg1 >>> 0, arg2, arg3 >>> 0, arg4 !== 0, arg5, arg6);
    };
    imports.wbg.__widl_f_vertex_attrib_divisor_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).vertexAttribDivisor(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__widl_f_enable_vertex_attrib_array_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__widl_f_enable_vertex_attrib_array_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).enableVertexAttribArray(arg1 >>> 0);
    };
    imports.wbg.__widl_f_copy_buffer_sub_data_with_i32_and_i32_and_i32_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).copyBufferSubData(arg1 >>> 0, arg2 >>> 0, arg3, arg4, arg5);
    };
    imports.wbg.__widl_f_draw_elements_with_i32_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawElements(arg1 >>> 0, arg2, arg3 >>> 0, arg4);
    };
    imports.wbg.__widl_f_tex_parameterf_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).texParameterf(arg1 >>> 0, arg2 >>> 0, arg3);
    };
    imports.wbg.__widl_f_bind_framebuffer_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__widl_f_bind_framebuffer_WebGLRenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).bindFramebuffer(arg1 >>> 0, getObject(arg2));
    };
    imports.wbg.__widl_f_tex_parameterf_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        getObject(arg0).texParameterf(arg1 >>> 0, arg2 >>> 0, arg3);
    };
    imports.wbg.__widl_f_draw_arrays_instanced_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawArraysInstanced(arg1 >>> 0, arg2, arg3, arg4);
    };
    imports.wbg.__widl_f_draw_elements_with_i32_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).drawElements(arg1 >>> 0, arg2, arg3 >>> 0, arg4);
    };
    imports.wbg.__widl_f_tex_sub_image_2d_with_i32_and_i32_and_u32_and_type_and_i32_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9) {
        try {
            getObject(arg0).texSubImage2D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7 >>> 0, arg8 >>> 0, arg9);
        } catch (e) {
            handleError(e);
        }
    };
    imports.wbg.__widl_f_tex_sub_image_3d_with_i32_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10, arg11) {
        try {
            getObject(arg0).texSubImage3D(arg1 >>> 0, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0, arg11);
        } catch (e) {
            handleError(e);
        }
    };
    imports.wbg.__widl_f_draw_elements_instanced_with_i32_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5) {
        getObject(arg0).drawElementsInstanced(arg1 >>> 0, arg2, arg3 >>> 0, arg4, arg5);
    };
    imports.wbg.__widl_f_uniform_matrix3fv_with_f32_array_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        let varg3 = getArrayF32FromWasm(arg3, arg4);
        getObject(arg0).uniformMatrix3fv(getObject(arg1), arg2 !== 0, varg3);
    };
    imports.wbg.__widl_f_uniform_matrix2fv_with_f32_array_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        let varg3 = getArrayF32FromWasm(arg3, arg4);
        getObject(arg0).uniformMatrix2fv(getObject(arg1), arg2 !== 0, varg3);
    };
    imports.wbg.__widl_f_uniform_matrix4fv_with_f32_array_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        let varg3 = getArrayF32FromWasm(arg3, arg4);
        getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, varg3);
    };
    imports.wbg.__widl_f_uniform4fv_with_f32_array_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        let varg2 = getArrayF32FromWasm(arg2, arg3);
        getObject(arg0).uniform4fv(getObject(arg1), varg2);
    };
    imports.wbg.__widl_f_uniform3fv_with_f32_array_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        let varg2 = getArrayF32FromWasm(arg2, arg3);
        getObject(arg0).uniform3fv(getObject(arg1), varg2);
    };
    imports.wbg.__widl_f_uniform1f_WebGLRenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1f(getObject(arg1), arg2);
    };
    imports.wbg.__widl_f_uniform2fv_with_f32_array_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        let varg2 = getArrayF32FromWasm(arg2, arg3);
        getObject(arg0).uniform2fv(getObject(arg1), varg2);
    };
    imports.wbg.__widl_f_uniform4iv_with_i32_array_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        let varg2 = getArrayI32FromWasm(arg2, arg3);
        getObject(arg0).uniform4iv(getObject(arg1), varg2);
    };
    imports.wbg.__widl_f_uniform3iv_with_i32_array_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        let varg2 = getArrayI32FromWasm(arg2, arg3);
        getObject(arg0).uniform3iv(getObject(arg1), varg2);
    };
    imports.wbg.__widl_f_uniform2iv_with_i32_array_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        let varg2 = getArrayI32FromWasm(arg2, arg3);
        getObject(arg0).uniform2iv(getObject(arg1), varg2);
    };
    imports.wbg.__widl_f_uniform2iv_with_i32_array_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        let varg2 = getArrayI32FromWasm(arg2, arg3);
        getObject(arg0).uniform2iv(getObject(arg1), varg2);
    };
    imports.wbg.__widl_f_uniform_matrix4fv_with_f32_array_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        let varg3 = getArrayF32FromWasm(arg3, arg4);
        getObject(arg0).uniformMatrix4fv(getObject(arg1), arg2 !== 0, varg3);
    };
    imports.wbg.__widl_f_uniform3iv_with_i32_array_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        let varg2 = getArrayI32FromWasm(arg2, arg3);
        getObject(arg0).uniform3iv(getObject(arg1), varg2);
    };
    imports.wbg.__widl_f_uniform_matrix2fv_with_f32_array_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        let varg3 = getArrayF32FromWasm(arg3, arg4);
        getObject(arg0).uniformMatrix2fv(getObject(arg1), arg2 !== 0, varg3);
    };
    imports.wbg.__widl_f_uniform4iv_with_i32_array_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        let varg2 = getArrayI32FromWasm(arg2, arg3);
        getObject(arg0).uniform4iv(getObject(arg1), varg2);
    };
    imports.wbg.__widl_f_uniform3fv_with_f32_array_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        let varg2 = getArrayF32FromWasm(arg2, arg3);
        getObject(arg0).uniform3fv(getObject(arg1), varg2);
    };
    imports.wbg.__widl_f_uniform_matrix3fv_with_f32_array_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        let varg3 = getArrayF32FromWasm(arg3, arg4);
        getObject(arg0).uniformMatrix3fv(getObject(arg1), arg2 !== 0, varg3);
    };
    imports.wbg.__widl_f_uniform4fv_with_f32_array_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        let varg2 = getArrayF32FromWasm(arg2, arg3);
        getObject(arg0).uniform4fv(getObject(arg1), varg2);
    };
    imports.wbg.__widl_f_blend_equation_separate_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).blendEquationSeparate(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__widl_f_blend_equation_separate_WebGLRenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).blendEquationSeparate(arg1 >>> 0, arg2 >>> 0);
    };
    imports.wbg.__widl_f_blend_func_separate_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__widl_f_blend_func_separate_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).blendFuncSeparate(arg1 >>> 0, arg2 >>> 0, arg3 >>> 0, arg4 >>> 0);
    };
    imports.wbg.__widl_f_color_mask_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
    };
    imports.wbg.__widl_f_color_mask_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        getObject(arg0).colorMask(arg1 !== 0, arg2 !== 0, arg3 !== 0, arg4 !== 0);
    };
    imports.wbg.__widl_f_uniform1f_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).uniform1f(getObject(arg1), arg2);
    };
    imports.wbg.__widl_f_polygon_offset_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).polygonOffset(arg1, arg2);
    };
    imports.wbg.__widl_f_polygon_offset_WebGLRenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).polygonOffset(arg1, arg2);
    };
    imports.wbg.__widl_f_line_width_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).lineWidth(arg1);
    };
    imports.wbg.__widl_f_line_width_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).lineWidth(arg1);
    };
    imports.wbg.__widl_f_uniform2fv_with_f32_array_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        let varg2 = getArrayF32FromWasm(arg2, arg3);
        getObject(arg0).uniform2fv(getObject(arg1), varg2);
    };
    imports.wbg.__widl_f_attach_shader_WebGL2RenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__widl_f_attach_shader_WebGLRenderingContext = function(arg0, arg1, arg2) {
        getObject(arg0).attachShader(getObject(arg1), getObject(arg2));
    };
    imports.wbg.__widl_f_get_error_WebGL2RenderingContext = function(arg0) {
        return getObject(arg0).getError();
    };
    imports.wbg.__widl_f_get_error_WebGLRenderingContext = function(arg0) {
        return getObject(arg0).getError();
    };
    imports.wbg.__wbg_scinternalcompilergetdecoration_8a7e2cc3dcccfd58 = function(arg0, arg1, arg2, arg3) {
        return sc_internal._sc_internal_compiler_get_decoration(arg0 >>> 0, arg1 >>> 0, arg2 >>> 0, arg3 >>> 0);
    };
    imports.wbg.__wbindgen_memory = function() {
        return addHeapObject(wasm.memory);
    };
    imports.wbg.__wbg_buffer_e04d67bf3bf41917 = function(arg0) {
        return addHeapObject(getObject(arg0).buffer);
    };
    imports.wbg.__wbg_newwithbyteoffsetandlength_9cfc37146f8a28ba = function(arg0, arg1, arg2) {
        return addHeapObject(new Uint8Array(getObject(arg0), arg1 >>> 0, arg2 >>> 0));
    };
    imports.wbg.__wbg_buffer_8e5aea6b31e81213 = function(arg0) {
        return addHeapObject(getObject(arg0).buffer);
    };
    imports.wbg.__wbg_length_cfa4a8dd9fc9bbfc = function(arg0) {
        return getObject(arg0).length;
    };
    imports.wbg.__wbg_set_2cce886d07c10f52 = function(arg0, arg1, arg2) {
        getObject(arg0).set(getObject(arg1), arg2 >>> 0);
    };
    imports.wbg.__widl_f_create_framebuffer_WebGL2RenderingContext = function(arg0) {

        const val = getObject(arg0).createFramebuffer();
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_create_framebuffer_WebGLRenderingContext = function(arg0) {

        const val = getObject(arg0).createFramebuffer();
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_delete_framebuffer_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).deleteFramebuffer(getObject(arg1));
    };
    imports.wbg.__widl_f_delete_framebuffer_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).deleteFramebuffer(getObject(arg1));
    };
    imports.wbg.__wbg_new_b3a6d73da508ceb3 = function() {
        return addHeapObject(new Array());
    };
    imports.wbg.__wbg_push_7936289c733f57be = function(arg0, arg1) {
        return getObject(arg0).push(getObject(arg1));
    };
    imports.wbg.__widl_f_draw_buffers_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).drawBuffers(getObject(arg1));
    };
    imports.wbg.__widl_f_get_parameter_WebGL2RenderingContext = function(arg0, arg1) {
        try {
            return addHeapObject(getObject(arg0).getParameter(arg1 >>> 0));
        } catch (e) {
            handleError(e);
        }
    };
    imports.wbg.__widl_f_get_parameter_WebGLRenderingContext = function(arg0, arg1) {
        try {
            return addHeapObject(getObject(arg0).getParameter(arg1 >>> 0));
        } catch (e) {
            handleError(e);
        }
    };
    imports.wbg.__wbindgen_string_get = function(arg0, arg1) {
        const obj = getObject(arg0);
        if (typeof(obj) !== 'string') return 0;
        const ptr = passStringToWasm(obj);
        getUint32Memory()[arg1 / 4] = WASM_VECTOR_LEN;
        return ptr;
    };
    imports.wbg.__widl_f_get_uniform_location_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3) {
        let varg2 = getStringFromWasm(arg2, arg3);

        const val = getObject(arg0).getUniformLocation(getObject(arg1), varg2);
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_get_uniform_location_WebGLRenderingContext = function(arg0, arg1, arg2, arg3) {
        let varg2 = getStringFromWasm(arg2, arg3);

        const val = getObject(arg0).getUniformLocation(getObject(arg1), varg2);
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_fence_sync_WebGL2RenderingContext = function(arg0, arg1, arg2) {

        const val = getObject(arg0).fenceSync(arg1 >>> 0, arg2 >>> 0);
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_debug_1_ = function(arg0) {
        console.debug(getObject(arg0));
    };
    imports.wbg.__widl_f_error_1_ = function(arg0) {
        console.error(getObject(arg0));
    };
    imports.wbg.__widl_f_info_1_ = function(arg0) {
        console.info(getObject(arg0));
    };
    imports.wbg.__widl_f_log_1_ = function(arg0) {
        console.log(getObject(arg0));
    };
    imports.wbg.__widl_f_warn_1_ = function(arg0) {
        console.warn(getObject(arg0));
    };
    imports.wbg.__wbg_newnoargs_8d1797b163dbc9fb = function(arg0, arg1) {
        let varg0 = getStringFromWasm(arg0, arg1);
        return addHeapObject(new Function(varg0));
    };
    imports.wbg.__wbg_call_836fa928f74337e5 = function(arg0, arg1) {
        try {
            return addHeapObject(getObject(arg0).call(getObject(arg1)));
        } catch (e) {
            handleError(e);
        }
    };
    imports.wbg.__wbindgen_object_clone_ref = function(arg0) {
        return addHeapObject(getObject(arg0));
    };
    imports.wbg.__wbindgen_debug_string = function(ret, arg0) {

        const retptr = passStringToWasm(debugString(getObject(arg0)));
        const retlen = WASM_VECTOR_LEN;
        const mem = getUint32Memory();
        mem[ret / 4] = retptr;
        mem[ret / 4 + 1] = retlen;

    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        let varg0 = getStringFromWasm(arg0, arg1);
        throw new Error(varg0);
    };
    imports.wbg.__widl_instanceof_Window = function(arg0) {
        return getObject(arg0) instanceof Window;
    };
    imports.wbg.__widl_f_document_Window = function(arg0) {

        const val = getObject(arg0).document;
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_create_element_Document = function(arg0, arg1, arg2) {
        let varg1 = getStringFromWasm(arg1, arg2);
        try {
            return addHeapObject(getObject(arg0).createElement(varg1));
        } catch (e) {
            handleError(e);
        }
    };
    imports.wbg.__widl_instanceof_HTMLCanvasElement = function(arg0) {
        return getObject(arg0) instanceof HTMLCanvasElement;
    };
    imports.wbg.__widl_f_set_attribute_Element = function(arg0, arg1, arg2, arg3, arg4) {
        let varg1 = getStringFromWasm(arg1, arg2);
        let varg3 = getStringFromWasm(arg3, arg4);
        try {
            getObject(arg0).setAttribute(varg1, varg3);
        } catch (e) {
            handleError(e);
        }
    };
    imports.wbg.__wbg_new_b276d8d930d44595 = function() {
        return addHeapObject(new Object());
    };
    imports.wbg.__wbg_set_001d7d49c8e6f145 = function(arg0, arg1, arg2) {
        try {
            return Reflect.set(getObject(arg0), getObject(arg1), getObject(arg2));
        } catch (e) {
            handleError(e);
        }
    };
    imports.wbg.__widl_f_get_context_with_context_options_HTMLCanvasElement = function(arg0, arg1, arg2, arg3) {
        let varg1 = getStringFromWasm(arg1, arg2);
        try {

            const val = getObject(arg0).getContext(varg1, getObject(arg3));
            return isLikeNone(val) ? 0 : addHeapObject(val);

        } catch (e) {
            handleError(e);
        }
    };
    imports.wbg.__widl_instanceof_WebGL2RenderingContext = function(arg0) {
        return getObject(arg0) instanceof WebGL2RenderingContext;
    };
    imports.wbg.__widl_f_body_Document = function(arg0) {

        const val = getObject(arg0).body;
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_append_child_Node = function(arg0, arg1) {
        try {
            return addHeapObject(getObject(arg0).appendChild(getObject(arg1)));
        } catch (e) {
            handleError(e);
        }
    };
    imports.wbg.__widl_f_check_framebuffer_status_WebGL2RenderingContext = function(arg0, arg1) {
        return getObject(arg0).checkFramebufferStatus(arg1 >>> 0);
    };
    imports.wbg.__widl_f_check_framebuffer_status_WebGLRenderingContext = function(arg0, arg1) {
        return getObject(arg0).checkFramebufferStatus(arg1 >>> 0);
    };
    imports.wbg.__wbg_requestAnimationFrame_9c3584a80ac2b77c = function(arg0) {
        requestAnimationFrame(takeObject(arg0));
    };
    imports.wbg.__wbindgen_cb_drop = function(arg0) {
        const obj = takeObject(arg0).original;
        if (obj.cnt-- == 1) {
            obj.a = 0;
            return true;
        }
        return false;
    };
    imports.wbg.__widl_f_performance_Window = function(arg0) {

        const val = getObject(arg0).performance;
        return isLikeNone(val) ? 0 : addHeapObject(val);

    };
    imports.wbg.__widl_f_now_Performance = function(arg0) {
        return getObject(arg0).now();
    };
    imports.wbg.__widl_f_blit_framebuffer_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9, arg10) {
        getObject(arg0).blitFramebuffer(arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8, arg9 >>> 0, arg10 >>> 0);
    };
    imports.wbg.__widl_f_get_buffer_sub_data_with_i32_and_u8_array_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        let varg3 = getArrayU8FromWasm(arg3, arg4);
        getObject(arg0).getBufferSubData(arg1 >>> 0, arg2, varg3);
    };
    imports.wbg.__widl_f_buffer_sub_data_with_i32_and_u8_array_WebGL2RenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        let varg3 = getArrayU8FromWasm(arg3, arg4);
        getObject(arg0).bufferSubData(arg1 >>> 0, arg2, varg3);
    };
    imports.wbg.__widl_f_buffer_sub_data_with_i32_and_u8_array_WebGLRenderingContext = function(arg0, arg1, arg2, arg3, arg4) {
        let varg3 = getArrayU8FromWasm(arg3, arg4);
        getObject(arg0).bufferSubData(arg1 >>> 0, arg2, varg3);
    };
    imports.wbg.__widl_f_delete_program_WebGL2RenderingContext = function(arg0, arg1) {
        getObject(arg0).deleteProgram(getObject(arg1));
    };
    imports.wbg.__widl_f_delete_program_WebGLRenderingContext = function(arg0, arg1) {
        getObject(arg0).deleteProgram(getObject(arg1));
    };
    imports.wbg.__wbindgen_closure_wrapper1725 = function(arg0, arg1, arg2) {

        const f = wasm.__wbg_function_table.get(134);
        const d = wasm.__wbg_function_table.get(135);
        const b = arg1;
        const cb = function(arg0) {
            this.cnt++;
            let a = this.a;
            this.a = 0;
            try {
                return f(a, b, arg0);

            } finally {
                if (--this.cnt === 0) d(a, b);
                else this.a = a;

            }

        };
        cb.a = arg0;
        cb.cnt = 1;
        let real = cb.bind(cb);
        real.original = cb;

        return addHeapObject(real);
    };

    if (module instanceof URL || typeof module === 'string' || module instanceof Request) {

        const response = fetch(module);
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            result = WebAssembly.instantiateStreaming(response, imports)
            .catch(e => {
                console.warn("`WebAssembly.instantiateStreaming` failed. Assuming this is because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
                return response
                .then(r => r.arrayBuffer())
                .then(bytes => WebAssembly.instantiate(bytes, imports));
            });
        } else {
            result = response
            .then(r => r.arrayBuffer())
            .then(bytes => WebAssembly.instantiate(bytes, imports));
        }
    } else {

        result = WebAssembly.instantiate(module, imports)
        .then(result => {
            if (result instanceof WebAssembly.Instance) {
                return { instance: result, module };
            } else {
                return result;
            }
        });
    }
    return result.then(({instance, module}) => {
        wasm = instance.exports;
        init.__wbindgen_wasm_module = module;
        wasm.__wbindgen_start();
        return wasm;
    });
}

export default init;

