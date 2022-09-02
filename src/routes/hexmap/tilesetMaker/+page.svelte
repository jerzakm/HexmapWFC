<script>
	import { onMount } from 'svelte';

	onMount(async () => {
		const res = await fetch('/api/tileset');
		const data = await res.json();
		console.log(data);
	});
</script>
