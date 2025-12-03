<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { deleteEntry as deleteEntryApi } from './api';
	import { generateToken } from './otp.service';
	

	const {
		entry,
		onDelete
	}: {
		entry: TOTPEntry;
		onDelete: (id: string) => void;
	} = $props();

	let token = $state('');
	let expiresIn = $state(30);
	let timer: unknown = 0;
	let tokenTimer: unknown = 0;

	onMount(() => {
		// Generate initial token
		generateCurrentToken();
		// Start timers
		startTimers();
	});

	onDestroy(() => {
		// Clear timers
		if (timer) clearInterval(timer as number);
		if (tokenTimer) clearInterval(tokenTimer as number);
	});

	function startTimers() {
		// Timer to update cooldown visualization
		timer = setInterval(() => {
			// Decrement expiresIn each second
			expiresIn = Math.max(0, expiresIn - 1);

			// When timer reaches 0, reset to 30 and fetch new token
			if (expiresIn === 0) {
				expiresIn = 30;
				generateCurrentToken();
			}
		}, 1000);

		// Timer to regenerate token every 30 seconds
		tokenTimer = setInterval(() => {
			generateCurrentToken();
		}, 30000);
	}

	async function generateCurrentToken() {
		try {
			if (entry && entry.id) {
				const result = await generateToken(entry.secret);
				if (result) {
					token = result.token;
					// Reset expiresIn when we get a new token
					expiresIn = result.expiresIn;
				}
			}
		} catch (error) {
			console.error('Failed to generate token:', error);
		}
	}

	async function copyToken() {
		if (!token) return;
		try {
			await navigator.clipboard.writeText(token);
			// Could add visual feedback here that token was copied
		} catch (error) {
			console.error('Failed to copy token:', error);
		}
	}

	async function deleteEntry() {
		await deleteEntryApi(entry.id);
		onDelete(entry.id);
	}
</script>

<div class="flex items-center justify-end space-x-2">
	<!-- Show token and cooldown -->
	<span
		onclick={copyToken}
		class="cursor-pointer font-mono text-lg bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded flex items-center"
		title="Click to copy"
		role="button"
		tabindex="0"
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') copyToken();
		}}
	>
		{token || '------'}
	</span>

	<!-- Cooldown visualization -->
	<div class="relative w-6 h-6">
		<svg class="w-6 h-6 text-blue-500" viewBox="0 0 24 24">
			<circle cx="12" cy="12" r="10" fill="none" stroke="#e5e7eb" stroke-width="2" />
			<circle
				cx="12"
				cy="12"
				r="10"
				fill="none"
				stroke="#3b82f6"
				stroke-width="2"
				stroke-dasharray="62.83"
				stroke-dashoffset={62.83 * (1 - expiresIn / 30)}
				transform="rotate(-90 12 12)"
			/>
		</svg>
	</div>

	<!-- Delete button -->
	<button onclick={deleteEntry} class="text-red-600 hover:text-red-900 ml-2" title="Delete entry">
		Delete
	</button>
</div>
