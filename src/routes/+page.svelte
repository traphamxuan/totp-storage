<script lang="ts">
	import { onMount } from 'svelte';
	import init from '@totp-store/totp-rs-web';
	import { listEntries } from '$lib/features/otp';
	import OtpForm from '$lib/features/otp/OtpForm.svelte';
	import OtpList from '$lib/features/otp/OtpList.svelte';

	let entries: TOTPEntry[] = $state([]);
	let total: number = $state(0);

	async function onEntryAdded(entry: TOTPEntry) {
		entries = [entry, ...entries];
		total = total + 1; // Increment total when adding an entry
	}
	// hXxinrTmrcUhJvrp
	async function loadEntries(
		page: number = 1,
		limit: number = 10,
		search?: string,
		sortBy?: string,
		sortOrder?: 'asc' | 'desc'
	) {
		try {
			// Fetch entries with secrets for offline use
		const result = await listEntries(page, limit, search, sortBy, sortOrder);
		if (result) {
			// If this is the first page, replace entries, otherwise append
			entries = result.entries;
			total = result.total;
		}
		} catch (error) {
			console.error('Error loading entries:', error);
		}
	}

	async function handleDelete(id: string) {
		entries = entries.filter((entry) => entry.id !== id);
		total = total - 1; // Decrement total when removing an entry
	}

	// Function to check if browser is Chrome/Chromium-based
	function isChromeBrowser(): boolean {
		return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
	}

	// Function to trigger Chrome extension installation
	function installExtension() {
		// In a real implementation, you would need to host the extension in the Chrome Web Store
		// For development/testing, users would load it manually as an unpacked extension
		alert(
			'To install the TOTP Store Chrome extension:\n\n1. Open Chrome and go to chrome://extensions\n2. Enable "Developer mode"\n3. Click "Load unpacked"\n4. Select the chrome-extension folder from the project directory\n\nNote: For production deployment, the extension would be available in the Chrome Web Store.'
		);
	}

	onMount(async () => {
		await init();
		await loadEntries();
	});
</script>

<div class="max-w-4xl mx-auto p-4 relative">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold text-center flex-1">TOTP Storage</h1>
		{#if isChromeBrowser()}
			<button
				onclick={installExtension}
				class="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition duration-300 text-sm"
				title="Install Chrome Extension"
			>
				Login
			</button>
		{/if}
	</div>

	<!-- Add New TOTP Form -->
	<OtpForm {onEntryAdded} />

	<OtpList bind:entries {total} onLoad={loadEntries} onDelete={handleDelete} />
</div>
