export const loadImage = (url: string): Promise<HTMLImageElement> => {
	return new Promise((resolve) => {
		const image = new Image();
		image.src = url;
		image.addEventListener('load', () => {
			resolve(image);
		});
	});
};
