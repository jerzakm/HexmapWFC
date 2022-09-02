import * as PIXI from 'pixi.js';

export const initPixiApp = () => {
	const app = new PIXI.Application({
		width: window.innerWidth,
		height: window.innerHeight,
		backgroundColor: 0x1099bb,
		resolution: window.devicePixelRatio || 1,
		resizeTo: window
	});
	document.body.appendChild(app.view);

	app.view.style.position = 'fixed';
	app.view.style.top = '0';
	app.view.style.left = '0';

	window.addEventListener('resize', () => {
		//
	});

	return { app };
};
