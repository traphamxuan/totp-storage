<script lang="ts">
	import { addEntry } from './api';
	import { enrollTOTP, decodeQRCodeFromBase64, generateToken, generateSecret } from './otp.service';
	import { onMount, onDestroy } from 'svelte';

	const { onEntryAdded }: { onEntryAdded: (entry: TOTPEntry) => Promise<void> } = $props();

	let enrollment: EnrollmentResult = $state({
		id: '',
		secret: '',
		issuer: '',
		label: '',
		qrCodeUrl: '',
		qrCodeDataUrl: '',
		createdAt: new Date()
	});
	let generatingQrCode: ReturnType<typeof setTimeout> | null = null;
	let submitting: boolean = $state(false);

	onMount(() => {
		// Add event listener for paste events only in browser environment
		if (typeof window !== 'undefined') {
			window.addEventListener('paste', handleClipboardPaste);
		}
	});
	onDestroy(() => {
		// Clean up event listener only in browser environment
		if (typeof window !== 'undefined') {
			window.removeEventListener('paste', handleClipboardPaste);
		}
	});
	async function createTOTPEntry() {
		if (generatingQrCode) clearTimeout(generatingQrCode);

		if (!enrollment.secret) {
			enrollment.qrCodeDataUrl = '';
			enrollment.qrCodeUrl = '';
			return;
		}

		generatingQrCode = setTimeout(async () => {
			try {
				enrollment = await enrollTOTP({
					issuer: enrollment.issuer,
					label: enrollment.label,
					secret: enrollment.secret || undefined
				});
			} catch (error) {
				console.error('Error creating TOTP entry:', error);
			} finally {
				generatingQrCode = null;
			}
		}, 100);
	}

	async function genSecret() {
		enrollment.secret = generateSecret();
		return createTOTPEntry();
	}

	async function submitOTPEntry() {
		submitting = true;
		try {
			const enroll = await enrollTOTP({ ...enrollment });
			const entry = await addEntry(enroll);
			if (entry) {
				await onEntryAdded(entry);
				enrollment.secret = '';
				enrollment.qrCodeDataUrl = '';
				enrollment.qrCodeUrl = '';
				enrollment.issuer = '';
				enrollment.label = '';
			}
		} catch (error) {
			console.error('Error submitting OTP entry:', error);
		} finally {
			submitting = false;
		}
	}

	// Function to handle file upload
	async function handleQRUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		const file = input.files[0];
		const reader = new FileReader();

		reader.onload = async function (e) {
			try {
				const imageData = e.target?.result as string;
				// Decode the QR code to extract the secret
				const decodedContent = decodeQRCodeFromBase64(imageData);

				// Check if it's a TOTP URI
				if (decodedContent.startsWith('otpauth://totp/')) {
					const url = new URL(decodedContent);
					const secret = url.searchParams.get('secret');
					const issuer = url.searchParams.get('issuer') || '';

					if (secret) {
						enrollment.secret = secret;
						enrollment.issuer = issuer;
						// Extract label from path
						const label = url.pathname.substring(1); // Remove leading slash
						enrollment.label = decodeURIComponent(label);

						// Regenerate QR code with the extracted values
						await createTOTPEntry();
					} else {
						alert('No secret found in the QR code');
					}
				} else {
					alert('Decoded content is not a valid TOTP URI');
				}
			} catch (error) {
				console.error('Error decoding QR code:', error);
				alert('Failed to decode QR code. Please try another image.');
			}
		};

		reader.readAsDataURL(file);
	}

	// New function to handle clipboard paste events
	async function handleClipboardPaste(event: ClipboardEvent) {
		// Only process if component is still mounted and in browser environment
		const items = event.clipboardData?.items;
		if (!items) return;
		for (const item of items) {
			// Check if the item is an image
			if (item.type.indexOf('image') !== -1) {
				const file = item.getAsFile();
				if (!file) continue;

				const reader = new FileReader();
				reader.onload = async function (e) {
					try {
						const imageData = e.target?.result as string;
						// Decode the QR code to extract the secret
						const decodedContent = decodeQRCodeFromBase64(imageData);

						// Check if it's a TOTP URI
						if (decodedContent.startsWith('otpauth://totp/')) {
							const url = new URL(decodedContent);
							const secret = url.searchParams.get('secret');
							const issuer = url.searchParams.get('issuer') || '';

							if (secret) {
								enrollment.secret = secret;
								enrollment.issuer = issuer;
								// Extract label from path
								const label = url.pathname.substring(1); // Remove leading slash
								enrollment.label = decodeURIComponent(label);

								// Regenerate QR code with the extracted values
								await createTOTPEntry();
							} else {
								alert('No secret found in the QR code');
							}
						} else {
							alert('Decoded content is not a valid TOTP URI');
						}
					} catch (error) {
						console.error('Error decoding QR code from clipboard:', error);
						alert('Failed to decode QR code from clipboard. Please try another image.');
					}
				};
				reader.readAsDataURL(file);
				break; // Process only the first image
			}
		}
	}
</script>

<div class="bg-white rounded-lg shadow-md p-6 mb-8">
	<h2 class="text-xl font-semibold mb-4">Add New TOTP Key</h2>
	<form onsubmit={submitOTPEntry} class="space-y-4">
		<div>
			<label for="issuer" class="block text-sm font-medium text-gray-700 mb-1"
				>Issuer (Optional)</label
			>
			<input
				type="text"
				id="issuer"
				bind:value={enrollment.issuer}
				oninput={() => createTOTPEntry()}
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
				bind:value={enrollment.label}
				oninput={() => createTOTPEntry()}
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
				placeholder="e.g., john@example.com"
			/>
		</div>

		<div>
			<label for="secret" class="block text-sm font-medium text-gray-700 mb-1">
				Secret (Optional - Enter to generate QR code)
			</label>
			<div class="flex gap-2">
				<input
					type="text"
					id="secret"
					bind:value={enrollment.secret}
					oninput={() => createTOTPEntry()}
					class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Enter TOTP secret or paste QR code URI"
				/>
				<button
					type="button"
					onclick={() => genSecret()}
					class="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					title="Generate new secret"
				>
					↻
				</button>
			</div>
		</div>

		{#if enrollment.qrCodeDataUrl}
			<div class="mt-4 p-4 border rounded-lg bg-gray-50">
				<h3 class="text-lg font-medium mb-2">QR Code</h3>
				<img
					src={enrollment.qrCodeDataUrl}
					alt="TOTP QR Code"
					class="mx-auto w-48 h-48 object-contain"
				/>
				<p class="text-sm text-gray-600 mt-2 text-center">
					Scan this QR code with your authenticator app
				</p>
			</div>
		{/if}

		<div class="border-t border-gray-200 pt-4">
			<span class="block text-sm font-medium text-gray-700 mb-2"> Or upload a QR code image </span>
			<input
				type="file"
				accept="image/*"
				onchange={handleQRUpload}
				class="block w-full text-sm text-gray-500
					file:mr-4 file:py-2 file:px-4
					file:rounded-md file:border-0
					file:text-sm file:font-semibold
					file:bg-blue-50 file:text-blue-700
					hover:file:bg-blue-100"
			/>
			<p class="text-xs text-gray-500 mt-1">
				Upload a QR code image to extract the secret (Note: Full implementation would require QR
				decoding)
			</p>
			<p class="text-xs text-gray-500 mt-1">
				Alternatively, you can paste (Ctrl+V or Cmd+V) a QR code image directly from your clipboard.
			</p>
		</div>
		<button
			type="submit"
			disabled={submitting}
			class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-300 disabled:opacity-50"
		>
			{#if submitting}
				Adding...
			{:else}
				Add TOTP Key
			{/if}
		</button>
	</form>
</div>
