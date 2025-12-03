<script lang="ts">
	import { addEntry } from "./api";
	import { enrollTOTP } from "./otp.service";

	const { onEntryAdded }: { onEntryAdded: (entry: TOTPEntry) => Promise<void> } = $props();

	let form = $state({
		issuer: '',
		label: '',
		isLoading: false
	});

	async function addTOTPEntry(event: SubmitEvent) {
		event.preventDefault();
		form.isLoading = true;
		try {
			const enrollment = await enrollTOTP({
				issuer: form.issuer,
				label: form.label
			})
			const result = await addEntry(enrollment);
			if (result) {
				// Reset form
				form.issuer = '';
				form.label = '';
				// Call the callback function if provided
				await onEntryAdded(result);
			}
		} finally {
			form.isLoading = false;
		}
	}
</script>

<div class="bg-white rounded-lg shadow-md p-6 mb-8">
	<h2 class="text-xl font-semibold mb-4">Add New TOTP Key</h2>
	<form onsubmit={addTOTPEntry} class="space-y-4">
		<div>
			<label for="issuer" class="block text-sm font-medium text-gray-700 mb-1"
				>Issuer (Optional)</label
			>
			<input
				type="text"
				id="issuer"
				bind:value={form.issuer}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="e.g., Google, GitHub"
			/>
		</div>

		<div>
			<label for="label" class="block text-sm font-medium text-gray-700 mb-1"
				>Label (Optional)</label
			>
			<input
				type="text"
				id="label"
				bind:value={form.label}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="e.g., john@example.com"
			/>
		</div>

		<button
			type="submit"
			disabled={form.isLoading}
			class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
		>
			{#if form.isLoading}
				Adding...
			{:else}
				Add TOTP Key
			{/if}
		</button>
	</form>
</div>
