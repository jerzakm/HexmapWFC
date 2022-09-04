export interface HexTile {
	name: string;
	path: string;
	sideTags?: [
		string | undefined,
		string | undefined,
		string | undefined,
		string | undefined,
		string | undefined,
		string | undefined
	];
}

export interface TileBorderTag {
	name: string;
	color: number[];
}

export interface WfcTileSet {
	name: string;
	tiles: HexTile[];
	tags: TileBorderTag[];
}

export const fetchTileset = async () => {
	const rawJsonData = await fetch('/api/tileset');
	const tileSet: WfcTileSet = await rawJsonData.json();
	return tileSet;
};
