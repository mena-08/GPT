import {gl, earthShaderProgram, renderSkybox, renderEarth} from './renderWebGL';

let xrSession = null;
let xrReferenceSpace = null;

export async function onEnterXRClicked() {
    try {
        const session = await navigator.xr.requestSession('immersive-vr', {
            optionalFeatures: ["local"],
        });
        
        onSessionStarted(session);
    } catch (e) {
        console.error("Unable to start XR session:", e);
    }
}


function onSessionStarted(session) {
    //store the session for use in rendering and other functions
    xrSession = session;

    //create an XRWebGLLayer using the XR Session and your WebGL context
    let xrLayer = new XRWebGLLayer(session, gl, {framebufferScaleFactor: 0.8});

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
}

function onXRFrame(time, frame) {
    let session = frame.session;
    session.requestAnimationFrame(onXRFrame);
    let pose = frame.getViewerPose(xrReferenceSpace);

    if (pose) {

        gl.bindFramebuffer(gl.FRAMEBUFFER, xrSession.renderState.baseLayer.framebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (let view of pose.views) {

            const viewport = session.renderState.baseLayer.getViewport(view);
            gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
            
            const viewMatrix = view.transform.inverse.matrix;
            const projectionMatrix = view.projectionMatrix;

            //renderSkybox(gl,viewMatrix, projectionMatrix,skyboxProgram);
            renderEarth(gl, viewMatrix, projectionMatrix, earthShaderProgram);
        }
    }
    
}

