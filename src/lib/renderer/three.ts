import * as THREE from 'three';

export const initThreeRenderer = (canvas: HTMLCanvasElement) => {
	const renderer = new THREE.WebGLRenderer({
		alpha: true,
		canvas
	});
	renderer.setSize(window.innerWidth, window.innerHeight);

	return { renderer };
};
