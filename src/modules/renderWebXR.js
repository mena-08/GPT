import {gl, earthShaderProgram, skyboxProgram, renderSkybox, renderEarth, earthTexture, starfieldTexture } from './renderWebGL';


export async function onEnterXRClicked() {
    try {
        const session = await navigator.xr.requestSession('immersive-ar', {
            optionalFeatures: ["local"],
        });
        
        onSessionStarted(session);
    } catch (e) {
        console.error("Unable to start XR session:", e);
    }
}

let xrSession = null;
let xrReferenceSpace = null;

function onSessionStarted(session) {
    // Store the session for use in rendering and other functions
    xrSession = session;

    // Create an XRWebGLLayer using the XR Session and your WebGL context
    let glCanvas = document.createElement('canvas');
    //gl = glCanvas.getContext('webgl', { xrCompatible: true });
    let xrLayer = new XRWebGLLayer(session, gl);

    session.updateRenderState({ baseLayer: xrLayer });

    // Set up event listeners for session events
    session.addEventListener('end', onSessionEnded);

    // Set up the XR reference space
    session.requestReferenceSpace('local').then((refSpace) => {
        xrReferenceSpace = refSpace;
        session.requestAnimationFrame(onXRFrame);
    });
}


function onSessionEnded(event) {
    xrSession.removeEventListener('end', onSessionEnded);
    xrSession = null;
    console.log('Session ended');
    // Clean up any session-specific resources here
}

function onXRFrame(time, frame) {
    let session = frame.session;
    let pose = frame.getViewerPose(xrReferenceSpace);
    
    if (pose) {
        for (let view of pose.views) {
            const viewport = session.renderState.baseLayer.getViewport(view);
            gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
            
            const viewMatrix = view.transform.inverse.matrix;
            const projectionMatrix = view.projectionMatrix;
            
            // Here, pass the XR view's matrices instead of the camera's
            //renderSkybox(gl,viewMatrix, projectionMatrix,skyboxProgram);
            renderEarth(gl, viewMatrix, projectionMatrix, earthShaderProgram);
        }
    }
    
    session.requestAnimationFrame(onXRFrame);
}

