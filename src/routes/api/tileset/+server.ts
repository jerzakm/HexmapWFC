import type { WfcHexTile, WfcTileSet } from '$lib/hexmap/tileset';
import { readdirSync } from 'fs';

export function GET() {
	const random = Math.random();

	const setDirs = readdirSync('static/hexTileSets');

	const set = 'ZeshiosPixelHexTileset1.1';

	try {
		readFileSync(`static/hexTileSets/${set}.json`);
	} catch (e) {
		console.log('tileSet json config not found, loading raw files...');

		const setTilePaths = readdirSync(`static/hexTileSets/${set}`);
		const tiles: WfcHexTile[] = [];

		setTilePaths.map((tile) => {
			if (tile.includes('png')) tiles.push({ name: tile, path: `/hexTileSets/${set}/${tile}` });
		});

		const tileset: WfcTileSet = {
			name: set,
			tiles,
			tags: []
		};

		return new Response(JSON.stringify(tileset));
	}
}

export async function POST({ request }: any) {
	return {};
}
function readFileSync(arg0: string) {
	throw new Error('Function not implemented.');
}
