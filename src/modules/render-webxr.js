import { gl, earthShaderProgram,initialTexture, renderSkybox, bumpTexture, earthSphere, earthTexture, moonSphere, moonTexture, videoTexture, specularTexture, agentSphere, agentShaderProgram, loadVideoTexture} from './render-webgl';
import { startRecording, stopRecording, requestMicrophoneAccess } from './audio-manager';
import { quat, vec3 } from 'gl-matrix';
import { WGS84ToECEF } from './utilities';

let xrSession = null;
let xrReferenceSpace = null;
let controllers = [];
let gesture = null;

let sphereOrientation = quat.create();
let spherePosition = vec3.create();
let initialGripPosition = vec3.create();


export async function onEnterXRClicked() {
    try {
        const session = await navigator.xr.requestSession('immersive-vr', {
            optionalFeatures: ["local", "hand-tracking", "depth-sensing", "hit-test", "light-estimation", "transparent"]
        });
        onSessionStarted(session);
    } catch (e) {
        console.error("Unable to start XR session:", e);
    }
}

function onSessionStarted(session) {
    // reproduce short audio
    // const soundUrl = require("url:../ready2.mp3");
    // const audio = new Audio(soundUrl);
    //audio.play();

    //create an XRWebGLLayer using the XR Session and my WebGL context
    xrSession = session;
    let nativeScaleFactor = XRWebGLLayer.getNativeFramebufferScaleFactor(xrSession);
    let xrLayer = new XRWebGLLayer(session, gl, { framebufferScaleFactor: nativeScaleFactor, alpha: true });
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
        //controller -> transient-pointer for apple vision pro
        if (inputSource.targetRayMode === 'tracked-pointer' || inputSource.targetRayMode === 'transient-pointer') {
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
    });
}

function onSelectStart(event) {
    vec3.copy(spherePosition, earthSphere.getPosition());
    const gripPose = event.frame.getPose(event.inputSource.gripSpace, xrReferenceSpace);
    vec3.set(initialGripPosition, gripPose.transform.position.x, gripPose.transform.position.y, gripPose.transform.position.z);

    //voice recording start
    if (event.inputSource.handedness === "left") {
        //startRecording(true);
    }
    const controllerIndex = controllers.findIndex(controller => controller.inputSource === event.inputSource);
    if (controllerIndex !== -1) {
        controllers[controllerIndex].buttonPressed = true;
    }
}

function onSelectEnd(event) {
    if (event.inputSource.handedness === "left") {
        //stopRecording();
        //gesture=false;
    }
    vec3.set(initialGripPosition, 0, 0, 0);
    const controllerIndex = controllers.findIndex(controller => controller.inputSource === event.inputSource);
    if (controllerIndex !== -1) {
        controllers[controllerIndex].buttonPressed = false;
    }
}

function handleController(controller, frame) {
    if (controller.inputSource.handedness === "right" && controller.buttonPressed) {
        const gripPose = frame.getPose(controller.gripSpace, xrReferenceSpace);
        if (gripPose) {
            handleGripPose(gripPose);
        }
    } else if (controller.inputSource.handedness === "left" && controller.buttonPressed && controller.gripSpace) {
        const gripPose = frame.getPose(controller.gripSpace, xrReferenceSpace);
        if (gripPose) {
            handleGestures(true,controller, frame);
        }
    }
    
}
function handleGestures(follow,controller, frame) {
    gesture = follow;
    if(controller.inputSource.hand) {
        const palm = controller.inputSource.hand.get("wrist");
        if (palm) {
            const palmPose = frame.getPose(palm, xrReferenceSpace);
            if (palmPose) {
                const palmPosition = palmPose.transform.position;
                if(follow){
                    agentSphere.translate(palmPosition.x, palmPosition.y+0.2, palmPosition.z);
                }
            }            
        }
    }
}

function handleGripPose(gripPose) {
    const gripOrientation = quat.fromValues(
        gripPose.transform.orientation.x,
        gripPose.transform.orientation.y,
        gripPose.transform.orientation.z,
        gripPose.transform.orientation.w
    );

    const currentGripPosition = vec3.fromValues(
        gripPose.transform.position.x,
        gripPose.transform.position.y,
        gripPose.transform.position.z
    );

    const movementVector = calculateMovementVector(currentGripPosition);
    let diff = calculateDiff(gripOrientation);

    earthSphere.translate(movementVector[0], movementVector[1], movementVector[2]);
    earthSphere.rotate(diff);
}

function calculateMovementVector(currentGripPosition) {
    const movementVector = vec3.create();
    vec3.subtract(movementVector, currentGripPosition, initialGripPosition);
    vec3.scale(movementVector, movementVector, 1.5);
    vec3.add(movementVector, movementVector, spherePosition);
    return movementVector;
}

function calculateDiff(gripOrientation) {
    let diff = quat.create();
    quat.invert(gripOrientation, gripOrientation);
    quat.multiply(diff, sphereOrientation, gripOrientation);
    return diff;
}

function onXRFrame(time, frame) {
    //session handling
    let session = frame.session;
    session.requestAnimationFrame(onXRFrame);
    let viewerPose = frame.getViewerPose(xrReferenceSpace);

    if (!viewerPose) {
        return;
    }

    for (const controller of controllers) {
        handleController(controller, frame);
    }

    earthSphere.updateModelMatrix();

    handleFrameBuffer();

    for (let view of viewerPose.views) {
        handleView(view, session);
    }
}

function handleFrameBuffer() {
    gl.bindFramebuffer(gl.FRAMEBUFFER, xrSession.renderState.baseLayer.framebuffer);
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function handleView(view, session) {
    const viewport = session.renderState.baseLayer.getViewport(view);
    gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
    const viewMatrix = view.transform.inverse.matrix;
    const projectionMatrix = view.projectionMatrix;
    
    earthSphere.draw(earthShaderProgram, viewMatrix, projectionMatrix, initialTexture);
    if(gesture){
        agentSphere.draw(agentShaderProgram, viewMatrix, projectionMatrix);
    }    


    //moonSphere.draw(earthShaderProgram, viewMatrix, projectionMatrix, moonTexture);
    //marker.draw(earthShaderProgram, viewMatrix, projectionMatrix);
}