import { initPixiApp } from '$lib/renderer/pixi';
import * as PIXI from 'pixi.js';

import * as Honeycomb from 'honeycomb-grid';

export const initHexmap = (canvas: HTMLCanvasElement) => {
	const { app } = initPixiApp();

	const map = new PIXI.Container();
	app.stage.addChild(map);

	const hex = 'hexTileSets/ZeshiosPixelHexTileset1.1/PixelHex_zeshio_tile-001.png';
	const texture = PIXI.Texture.from(hex);

	const graphics = new PIXI.Graphics();
	graphics.lineStyle(1, 0x999999);

	const Hex = Honeycomb.extendHex({ size: 48, orientation: 'flat' });
	const Grid = Honeycomb.defineGrid(Hex);

	Grid.rectangle({ width: 100, height: 100 }).forEach((hex) => {
		const point = hex.toPoint();
		// add the hex's position to each of its corner points
		const corners = hex.corners().map((corner) => corner.add(point));
		// separate the first from the other corners
		const [firstCorner, ...otherCorners] = corners;

		// move the "pen" to the first corner
		graphics.moveTo(firstCorner.x, firstCorner.y);
		// draw lines to the other corners
		otherCorners.forEach(({ x, y }) => graphics.lineTo(x, y));
		// finish at the first corner
		graphics.lineTo(firstCorner.x, firstCorner.y);

		app.stage.addChild(graphics);

		const tile = new PIXI.Sprite(texture);
		tile.x = point.x;
		tile.y = point.y - 12;
		map.addChild(tile);
	});
};
