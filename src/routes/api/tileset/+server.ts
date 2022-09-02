import { readdirSync } from 'fs';

export function GET() {
	const random = Math.random();

	const setDirs = readdirSync('static/hexTileSets');

	const set = 'ZeshiosPixelHexTileset1.1';

	const setTilePaths = readdirSync(`static/hexTileSets/${set}`);
	const tiles = setTilePaths.map((tile) => {
		return {
			name: tile,
			path: `hexTileSets/${set}/${tile}`
		};
	});

	return new Response(
		JSON.stringify({
			setName: set,
			tiles
		})
	);
}

export async function POST({ request }: any) {
	return {};
}
