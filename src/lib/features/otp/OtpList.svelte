<script lang="ts">
	import Otp from './Otp.svelte';
	import type { Totp } from '$lib/entities';

	// Props
	let {
		entries = $bindable(),
		total = 0,
		onLoad
	}: {
		entries: Totp[];
		total: number;
		onLoad: (
			page: number,
			limit: number,
			search?: string,
			sortBy?: string,
			sortOrder?: 'asc' | 'desc'
		) => Promise<void>;
	} = $props();

	let currentPage = $state(1);

	// State
	let limit = $state(10);
	let contents = $derived(entries.slice(0, limit) || []);
	let searchQuery = $state('');

	// Debounce timer
	let searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

	// Sorting state
	let sortColumn = $state<'issuer' | 'label' | 'created'>('created');
	let sortDirection = $state<'asc' | 'desc'>('desc');

	// Calculate totalPages based on the total prop
	let totalPages = $derived(total > 0 ? Math.ceil(total / limit) : 1);

	const load = async (page: number) => {
		currentPage = page;
		// Always call onLoad when changing pages to ensure we have the right data
		await onLoad(page, limit, searchQuery || undefined, mapSortColumn(), sortDirection);
	};

	// Map frontend sort column names to backend field names
	function mapSortColumn(): string {
		switch (sortColumn) {
			case 'created':
				return 'createdAt';
			default:
				return sortColumn;
		}
	}

	// Toggle sort direction or change sort column
	function toggleSort(column: 'issuer' | 'label' | 'created') {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
		// Reload with new sort parameters
		load(currentPage);
	}

	// Handle search input changes
	function handleSearch() {
		// Clear existing timeout
		if (searchDebounceTimer) {
			clearTimeout(searchDebounceTimer);
		}

		// Set new timeout
		searchDebounceTimer = setTimeout(() => {
			// Reset to first page when search changes
			load(1);
		}, 500);
	}

	// Get sort indicator for column header
	function getSortIndicator(column: 'issuer' | 'label' | 'created') {
		if (sortColumn !== column) return '';
		return sortDirection === 'asc' ? ' ↑' : ' ↓';
	}
</script>

<div class="bg-white rounded-lg shadow-md p-6">
	<!-- Header row with title and search -->
	<div class="flex justify-between items-center mb-4">
		<h2 class="text-xl font-semibold">Stored TOTP Keys</h2>
		<input
			type="text"
			placeholder="Search issuer or label..."
			bind:value={searchQuery}
			oninput={handleSearch}
			class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>
	</div>

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
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
							onclick={() => toggleSort('issuer')}
						>
							Issuer{getSortIndicator('issuer')}
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
							onclick={() => toggleSort('label')}
						>
							Label{getSortIndicator('label')}
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
							onclick={() => toggleSort('created')}
						>
							Created{getSortIndicator('created')}
						</th>
						<th
							scope="col"
							class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
						>
							Token
						</th>
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
								<Otp {entry} />
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
