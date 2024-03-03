import * as THREE from 'three';

function createTextTexture(text, fontSize = '40px', fontFace = 'Arial', textColor = 'rgba(255, 255, 255, 1.0)') {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 512;
    canvas.height = 512;

    context.fillStyle = textColor;
    context.font = `${fontSize} ${fontFace}`;
    context.textBaseline = 'middle';
    context.textAlign = 'center';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    return texture;
}

function createTextSprite(text) {
    const textTexture = createTextTexture(text);
    const material = new THREE.SpriteMaterial({ map: textTexture });
    const sprite = new THREE.Sprite(material);

    return sprite;
}

function createGradientColorBar(color1, color2, param1, param2, metric) {
    // JavaScript
    const legendCanvas = document.getElementById('legendCanvas');
    const legendText = document.getElementById('legendText');
    const ctx = legendCanvas.getContext('2d');

    // Create a linear gradient
    // The x1, y1, x2, y2 parameters determine the gradient direction
    const gradient = ctx.createLinearGradient(0, 0, 400, 0);

    // Add color stops
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);    // Hottest

    // Fill the rectangle with the gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 50);
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillText(param1, 0, 40);
    ctx.fillText(param2, 380, 40);
    legendText.innerHTML = metric;
}

createGradientColorBar("black", "white", "0", "1", "Temperature (Celsius)");


export {createTextSprite, createTextTexture};