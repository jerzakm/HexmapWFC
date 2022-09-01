export const initCanvasWfc = async (canvas: HTMLCanvasElement) => {
	//
	const { width, height } = canvas.getBoundingClientRect();
	canvas.width = width;
	canvas.height = height;

	const gridSize = { x: 5, y: 5 };

	const grid: WfcSampleCell[][] = [];

	for (let x = 0; x < gridSize.x; x++) {
		grid[x] = [];
		for (let y = 0; y < gridSize.y; y++) {
			grid[x][y] = {
				collapsed: false,
				options: [...tileSet]
			};

			console.log(grid[x][y]);
		}
	}

	const ctx = canvas.getContext('2d');
	if (!ctx) return;
	ctx.fillStyle = '#aaaaaa';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	const tileImages: HTMLImageElement[] = [];
	for (const tile of tileSet) {
		const image = await loadImage(tile.imgSrc);
		tileImages.push(image);
	}
};

const loadImage = (url: string): Promise<HTMLImageElement> => {
	return new Promise((resolve) => {
		const image = new Image();
		image.src = url;
		image.addEventListener('load', () => {
			resolve(image);
		});
	});
};

const tileSet: WfcSampleTile[] = [
	{
		imgSrc: 'basicWfc/0.png',
		up: false,
		down: false,
		left: false,
		right: false
	},
	{
		imgSrc: 'basicWfc/1.png',
		up: true,
		down: true,
		left: false,
		right: false
	},
	{
		imgSrc: 'basicWfc/2.png',
		up: false,
		down: false,
		left: true,
		right: true
	},
	{
		imgSrc: 'basicWfc/3.png',
		up: true,
		down: false,
		left: true,
		right: true
	},
	{
		imgSrc: 'basicWfc/4.png',
		up: true,
		down: true,
		left: true,
		right: true
	},
	{
		imgSrc: 'basicWfc/5.png',
		up: true,
		down: true,
		left: true,
		right: false
	}
];

interface WfcSampleTile {
	imgSrc: string;
	// white - false, black - true
	up: boolean;
	down: boolean;
	left: boolean;
	right: boolean;
}

interface WfcSampleCell {
	collapsed: boolean;
	tile?: WfcSampleTile;
	options?: WfcSampleTile[];
}
