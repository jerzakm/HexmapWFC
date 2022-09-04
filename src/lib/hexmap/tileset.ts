export interface WfcHexTile {
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

export interface WfcTileTag {
	name: string;
	color: number[];
}

export interface WfcTileSet {
	name: string;
	tiles: WfcHexTile[];
	tags: WfcTileTag[];
}
