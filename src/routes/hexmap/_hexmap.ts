import { initThreeRenderer } from '$lib/renderer/three';
import * as THREE from 'three';

export const initHexmap = (canvas: HTMLCanvasElement) => {
	const { renderer } = initThreeRenderer(canvas);

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.z = 7;

	const map = new THREE.TextureLoader().load(
		'hexTileSets/ZeshiosPixelHexTileset1.1/PixelHex_zeshio_tile-001.png'
	);
	const material2 = new THREE.SpriteMaterial({ map: map });

	const sprite = new THREE.Sprite(material2);
	scene.add(sprite);

	function animate() {
		requestAnimationFrame(animate);
		renderer.render(scene, camera);
	}
	animate();
};
