import { gl, earthShaderProgram, renderSkybox, renderEarth, init, earthSphere } from './renderWebGL';
import { startRecording, stopRecording } from './audioManager';
import { mat4 ,quat, vec3, vec4 } from 'gl-matrix';

let xrSession = null;
let xrReferenceSpace = null;
let controllers = [];

let sphereOrientation = quat.create();
let delta = quat.create();
let gripPosition = vec3.create();

export async function onEnterXRClicked() {
    try {
        const session = await navigator.xr.requestSession('immersive-vr', {
            //optionalFeatures: ["depth-sensing", "dom-overlay", "hand-tracking", "hit-test", "layers", "light-estimation", "viewer"]
            optionalFeatures: ["local", "hand-tracking"]
        });

        onSessionStarted(session);
    } catch (e) {
        console.error("Unable to start XR session:", e);
    }
}

function onSessionStarted(session) {
    //create an XRWebGLLayer using the XR Session and my WebGL context

    earthSphere.translate(0, 5, 0);
    xrSession = session;
    let nativeScaleFactor = XRWebGLLayer.getNativeFramebufferScaleFactor(xrSession);
    let xrLayer = new XRWebGLLayer(session, gl, { framebufferScaleFactor: nativeScaleFactor });
    
    session.updateRenderState({ baseLayer: xrLayer });
    
    session.addEventListener('end', onSessionEnded);
    session.addEventListener('inputsourceschange', onInputSourcesChange);
    session.addEventListener('selectstart', onSelectStart);
    session.addEventListener('selectend', onSelectEnd);
    
    //set up the XR reference space
    session.requestReferenceSpace('local').then((refSpace) => {
        xrReferenceSpace = refSpace;
        session.requestAnimationFrame(onXRFrame);
    });
}

function onSessionEnded(event) {
    xrSession.removeEventListener('end', onSessionEnded);
    xrSession = null;
    alert('Immersive session ended');
}

function onInputSourcesChange(event) {
    controllers = [];
    
    event.session.inputSources.forEach((inputSource) => {
        //controller
        if(inputSource.targetRayMode === 'tracked-pointer'){
            const controller = {
                inputSource: inputSource,
                gripSpace: inputSource.gripSpace,
                buttonPressed: false,
            };
            controllers.push(controller);
        }//hands
        if(inputSource.hand){
            const hand = {
                inputSource: inputSource,
                hand: inputSource.hand,
                joints: Array.from(inputSource.hand.values())
            };
            controllers.push(hand);
        }
        //transient pointer for apple vision pro
        if(inputSource.targetRayMode === 'transient-pointer'){
            const controller = {
                inputSource: inputSource,
                gripSpace: inputSource.gripSpace,
                buttonPressed: false,
            };
            controllers.push(controller);
        }
    });
}

function onSelectStart(event) {
    const controllerIndex = controllers.findIndex(controller => controller.inputSource === event.inputSource);
    if (controllerIndex !== -1) {
        controllers[controllerIndex].buttonPressed = true;
    }
}

function onSelectEnd(event) {
    const controllerIndex = controllers.findIndex(controller => controller.inputSource === event.inputSource);
    if (controllerIndex !== -1) {
        controllers[controllerIndex].buttonPressed = false;
    }
}

function onXRFrame(time, frame) {
    let session = frame.session;
    session.requestAnimationFrame(onXRFrame);
    let viewerPose = frame.getViewerPose(xrReferenceSpace);

    if (viewerPose) {
        earthSphere.setIdentityModelMatrix();
        
        for (let controller of controllers) {
            const inputSource = controller.inputSource;
            if (inputSource.gripSpace && controller.buttonPressed) {
                const gripPose = frame.getPose(inputSource.gripSpace, xrReferenceSpace);
                if (gripPose) {
                    const gripOrientation = quat.fromValues(
                        gripPose.transform.orientation.x,
                        gripPose.transform.orientation.y,
                        gripPose.transform.orientation.z,
                        gripPose.transform.orientation.w
                    );
                    
                    let diff = quat.create();
                    quat.invert(gripOrientation, gripOrientation);
                    quat.multiply(diff, gripOrientation, sphereOrientation);
                    quat.copy(delta, diff);

                    gripPosition = gripPose.transform.position;

                }
            }
        }
        
        earthSphere.setOrientation(delta);
        //weird ass stuff, look further into ths
        if(gripPosition['0'] != 0){
            earthSphere.translate(gripPosition.x+2, gripPosition.y+2, gripPosition.z);
            console.log("gripPosition", earthSphere.getPosition());
        }
        
        gl.bindFramebuffer(gl.FRAMEBUFFER, xrSession.renderState.baseLayer.framebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (let view of viewerPose.views) {
            const viewport = session.renderState.baseLayer.getViewport(view);
            gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

            const viewMatrix = view.transform.inverse.matrix;
            const projectionMatrix = view.projectionMatrix;

            //renderSkybox(gl,viewMatrix, projectionMatrix,skyboxProgram);
            renderEarth(gl, viewMatrix, projectionMatrix, earthShaderProgram, earthSphere.modelMatrix);
        }
    }

}

