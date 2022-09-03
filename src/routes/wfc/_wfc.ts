import { loadImage } from '$lib/renderer/canvas';

export const initCanvasWfc = async (canvas: HTMLCanvasElement) => {
	//
	const { width, height } = canvas.getBoundingClientRect();

	const gridSize = { x: 20, y: 20 };
	const cellSize = 30;

	canvas.width = gridSize.x * cellSize;
	canvas.height = gridSize.y * cellSize;

	const grid: WfcSampleCell[][] = [];
	const cells: WfcSampleCell[] = [];

	for (let x = 0; x < gridSize.x; x++) {
		grid[x] = [];
		for (let y = 0; y < gridSize.y; y++) {
			const cell = {
				collapsed: false,
				options: [...tileSet],
				x,
				y
			};
			grid[x][y] = cell;
			cells.push(cell);
		}
	}

	const ctx = canvas.getContext('2d');
	if (!ctx) return;
	ctx.fillStyle = '#aaaaaa';
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for (const tile of tileSet) {
		tile.image = await loadImage(tile.imgSrc);
	}

	// 1. Pick random position on grid and a random tile. Collapse it.
	collapseTile(Math.floor(Math.random() * gridSize.x), Math.floor(Math.random() * gridSize.y));
	collapseStep();

	function collapseStep() {
		cells.sort((a, b) => {
			return a.options.length - b.options.length;
		});

		for (let i = 0; i < cells.length; i++) {
			if (!cells[i].collapsed) {
				collapseTile(cells[i].x, cells[i].y);
				break;
			}
		}

		const uncollapsed = cells.find((c) => {
			return !c.collapsed;
		});

		if (uncollapsed) {
			setTimeout(collapseStep, 5);
			console.count('collapsing');
		} else {
			console.log('no more uncollapsed tiles');
		}
	}

	function collapseTile(x: number, y: number) {
		//
		const cell = grid[x][y];
		cell.collapsed = true;
		cell.tile = cell.options[Math.floor(Math.random() * cell.options.length)];

		if (cell.tile.image) {
			ctx?.drawImage(cell.tile.image, x * cellSize, y * cellSize);
		}

		// 1.1 After collapsing a tile, recalculate neighbour options
		const neighbours: (WfcSampleCell | null)[] = Object.values(getNeighbours(x, y));
		for (const cell of neighbours) {
			if (cell) calculateOptions(cell);
		}
	}

	function calculateOptions(cell: WfcSampleCell) {
		const n = getNeighbours(cell.x, cell.y);

		let options = [...tileSet];

		if (n.up?.collapsed) {
			const connector = n.up.tile?.down;
			options = options.filter((p) => {
				return p.up === connector;
			});
		}
		if (n.down?.collapsed) {
			const connector = n.down.tile?.up;
			options = options.filter((p) => {
				return p.down === connector;
			});
		}
		if (n.left?.collapsed) {
			const connector = n.left.tile?.right;
			options = options.filter((p) => {
				return p.left === connector;
			});
		}
		if (n.right?.collapsed) {
			const connector = n.right.tile?.left;
			options = options.filter((p) => {
				return p.right === connector;
			});
		}

		cell.options = options;
	}

	function getNeighbours(x: number, y: number) {
		const neighbours: WfcSampleCellNeighbours = {
			up: null,
			down: null,
			left: null,
			right: null
		};

		// above
		if (y - 1 >= 0) {
			neighbours.up = grid[x][y - 1];
		}
		//below
		if (y + 1 < gridSize.y) {
			neighbours.down = grid[x][y + 1];
		}
		// left
		if (x - 1 >= 0) {
			neighbours.left = grid[x - 1][y];
		}
		// right
		if (x + 1 < gridSize.x) {
			neighbours.right = grid[x + 1][y];
		}

		return neighbours;
	}
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
	image?: HTMLImageElement;
	// white - false, black - true
	up: boolean;
	down: boolean;
	left: boolean;
	right: boolean;
}

interface WfcSampleCell {
	collapsed: boolean;
	tile?: WfcSampleTile;
	options: WfcSampleTile[];
	x: number;
	y: number;
}

interface WfcSampleCellNeighbours {
	up: null | WfcSampleCell;
	down: null | WfcSampleCell;
	left: null | WfcSampleCell;
	right: null | WfcSampleCell;
}
