export const initCanvasWfc = (canvas: HTMLCanvasElement) => {
	//
	const ctx = canvas.getContext('2d');
	if (!ctx) return;
	ctx.fillStyle = '#aaaaaa';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
};
