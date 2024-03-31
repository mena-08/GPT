/**
 * The function `loadTexture` in JavaScript loads an image from a URL and creates a texture in WebGL
 * context.
 * @param gl - The `gl` parameter in the `loadTexture` function is the WebGL rendering context. It is
 * used to interact with WebGL API functions for loading and working with textures in a WebGL
 * application.
 * @param url - The `url` parameter in the `loadTexture` function is the URL of the image that you want
 * to load as a texture in WebGL. This URL will be used to fetch the image data and apply it to the
 * WebGL texture.
 * @returns The `loadTexture` function is being returned, which is a function that loads an image
 * texture asynchronously in WebGL using a Promise.
 */
function loadTexture(gl, url) {
    return new Promise((resolve, reject) => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, pixel);

        const image = new Image();
        image.onload = function() {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);

            if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }

            resolve(texture);
        };
        image.onerror = reject;
        image.src = url;
    });
}


function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

export { loadTexture,loadImage };