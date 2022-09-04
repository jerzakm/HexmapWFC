import type { WfcHexTile, WfcTileSet } from '$lib/hexmap/tileset';
import type { RequestEvent } from '@sveltejs/kit';
import { readFileSync, writeFileSync } from 'fs';
import { readdirSync } from 'fs';

const SET_NAME = 'ZeshiosPixelHexTileset1.1';
const SET_PATH = `static/hexTileSets/${SET_NAME}.json`;

export function GET() {
	try {
		const tileset = readFileSync(SET_PATH);
		return new Response(tileset);
	} catch (e) {
		console.log('tileSet json config not found, loading raw files...');

		const setTilePaths = readdirSync(`static/hexTileSets/${SET_NAME}`);
		const tiles: WfcHexTile[] = [];

		setTilePaths.map((tile) => {
			if (tile.includes('png'))
				tiles.push({ name: tile, path: `/hexTileSets/${SET_NAME}/${tile}` });
		});

		const tileset: WfcTileSet = {
			name: SET_NAME,
			tiles,
			tags: []
		};

		return new Response(JSON.stringify(tileset));
	}
}

export async function POST({ request }: RequestEvent) {
	const tileset = await request.json();

	console.log('saving tileset');

	writeFileSync(SET_PATH, JSON.stringify(tileset, null, 4));

	return { tileset };
}
