import { gl, earthShaderProgram, renderSkybox, renderEarth, earthSphere } from './renderWebGL';
import { startRecording, stopRecording } from './audioManager';
import { quat, vec3 } from 'gl-matrix';

let xrSession = null;
let xrReferenceSpace = null;
let controllers = [];

let sphereOrientation = quat.create();
let delta = quat.create();
let spherePosition;

let initialGripPosition = null;

export async function onEnterXRClicked() {
    try {
        const session = await navigator.xr.requestSession('immersive-vr', {
            //optionalFeatures: ["depth-sensing", "dom-overlay", "hand-tracking", "hit-test", "layers", "light-estimation", "viewer"]
            optionalFeatures: ["local", "hand-tracking", "depth-sensing", "hit-test", "light-estimation"]
        });

        onSessionStarted(session);
    } catch (e) {
        console.error("Unable to start XR session:", e);
    }
}

function onSessionStarted(session) {
    //create an XRWebGLLayer using the XR Session and my WebGL context

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
        if (inputSource.targetRayMode === 'tracked-pointer') {
            const controller = {
                inputSource: inputSource,
                gripSpace: inputSource.gripSpace,
                buttonPressed: false,
            };
            controllers.push(controller);
        }//hands
        if (inputSource.hand) {
            const hand = {
                inputSource: inputSource,
                hand: inputSource.hand,
                joints: Array.from(inputSource.hand.values()),
                buttonPressed: false,
            };
            controllers.push(hand);
        }
        //transient pointer for apple vision pro
        if (inputSource.targetRayMode === 'transient-pointer') {
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
    spherePosition = earthSphere.getPosition();
    const inputSource = event.inputSource;
    const gripPose = event.frame.getPose(inputSource.gripSpace, xrReferenceSpace);
    initialGripPosition = vec3.fromValues(gripPose.transform.position.x, gripPose.transform.position.y, gripPose.transform.position.z);
    const controllerIndex = controllers.findIndex(controller => controller.inputSource === event.inputSource);
    if (controllerIndex !== -1) {
        controllers[controllerIndex].buttonPressed = true;
    }
}

function onSelectEnd(event) {
    initialGripPosition = vec3.fromValues(0, 0, 0);
    const controllerIndex = controllers.findIndex(controller => controller.inputSource === event.inputSource);
    if (controllerIndex !== -1) {
        controllers[controllerIndex].buttonPressed = false;
    }
}


function onXRFrame(time, frame) {
    //session handling
    let session = frame.session;
    session.requestAnimationFrame(onXRFrame);
    let viewerPose = frame.getViewerPose(xrReferenceSpace);

    if (viewerPose) {
        for (let controller of controllers) {
            const inputSource = controller.inputSource;

            if (inputSource.gripSpace && controller.buttonPressed) {
                const gripPose = frame.getPose(inputSource.gripSpace, xrReferenceSpace);

                if (gripPose && controller.buttonPressed) {
                    const gripOrientation = quat.fromValues(
                        gripPose.transform.orientation.x,
                        gripPose.transform.orientation.y,
                        gripPose.transform.orientation.z,
                        gripPose.transform.orientation.w
                    );

                    const currentGripPosition = {
                        x: gripPose.transform.position.x,
                        y: gripPose.transform.position.y,
                        z: gripPose.transform.position.z
                    };
                    const movementVector = {
                        x: (currentGripPosition.x - initialGripPosition[0]) * 1.5 + spherePosition[0],
                        y: (currentGripPosition.y - initialGripPosition[1]) * 1.5 + spherePosition[1],
                        z: (currentGripPosition.z - initialGripPosition[2]) * 1.5 + spherePosition[2]
                    };

                    let diff = quat.create();
                    quat.invert(gripOrientation, gripOrientation);
                    quat.multiply(diff, sphereOrientation, gripOrientation);
                    earthSphere.translate(movementVector.x, movementVector.y, movementVector.z);
                    earthSphere.rotate(diff);
                }
            }
        }
        earthSphere.updateModelMatrix();


        gl.bindFramebuffer(gl.FRAMEBUFFER, xrSession.renderState.baseLayer.framebuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        for (let view of viewerPose.views) {
            const viewport = session.renderState.baseLayer.getViewport(view);
            gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
            const viewMatrix = view.transform.inverse.matrix;
            const projectionMatrix = view.projectionMatrix;
            renderEarth(gl, viewMatrix, projectionMatrix, earthShaderProgram, earthSphere.modelMatrix);
        }
    }
}