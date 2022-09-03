export interface WfcHexTile {
	name: string;
	path: string;
	sideTags?: {
		0: string;
		1: string;
		2: string;
		3: string;
		4: string;
		5: string;
	};
}

export interface WfcTileTag {
	name: string;
	color: number;
}

export interface WfcTileSet {
	name: string;
	tiles: WfcHexTile[];
	tags: WfcTileTag[];
}
