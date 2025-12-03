<script lang="ts">
	import { onMount } from 'svelte';
	import Otp from './Otp.svelte';

	// Props
	let {
		entries = $bindable(),
        total = 0,
		onLoad,
		onDelete = (id: string) => {}
	}: {
		entries: TOTPEntry[];
        total: number;
		onLoad: (page: number, limit: number) => Promise<void>;
		onDelete: (id: string) => void;
	} = $props();

    let currentPage = $state(1);

	// State
	let limit = $state(10);
    let totalPages = $derived(total > 0 ? Math.ceil(total / limit) : 1);
    let contents: TOTPEntry[] = $derived(
        entries.slice((currentPage - 1) * limit, (currentPage - 1) * limit + limit)
    );

    const load = async (page: number) => {
        currentPage = page;
        // Always call onLoad when changing pages to ensure we have the right data
        await onLoad(page, limit);
    };
</script>

<div class="bg-white rounded-lg shadow-md p-6">
	<h2 class="text-xl font-semibold mb-4">Stored TOTP Keys</h2>

	{#if entries.length === 0}
		<div class="text-center py-8">
			<p class="text-gray-500">No TOTP keys stored yet.</p>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="min-w-full divide-y divide-gray-200">
				<thead class="bg-gray-50">
					<tr>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Issuer</th
						>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Label</th
						>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Created</th
						>
						<th
							scope="col"
							class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
							>Token</th
						>
					</tr>
				</thead>
				<tbody class="bg-white divide-y divide-gray-200">
					{#each contents as entry (entry.id)}
						<tr>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm font-medium text-gray-900">{entry.issuer}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap">
								<div class="text-sm text-gray-500">{entry.label}</div>
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{new Date(entry.createdAt).toLocaleDateString()}
							</td>
							<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
								<Otp {entry} onDelete={onDelete} />
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<!-- Pagination -->
		{#if totalPages > 1}
			<div class="flex justify-between items-center mt-6">
				<button
					onclick={() => load(currentPage - 1)}
					disabled={currentPage === 1}
					class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
				>
					Previous
				</button>

				<span class="text-sm text-gray-700">
					Page {currentPage} of {totalPages}
				</span>

				<button
					onclick={() => load(currentPage + 1)}
					disabled={currentPage === totalPages}
					class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
				>
					Next
				</button>
			</div>
		{/if}
	{/if}
</div>