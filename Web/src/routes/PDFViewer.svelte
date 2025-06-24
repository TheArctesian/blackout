<!-- PDFViewer.svelte -->
<script>
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import { fly, fade } from 'svelte/transition';

	export let pdfData;
	export let redactionMetadata;
	export let fileName;

	const dispatch = createEventDispatcher();

	let pdfDoc = null;
	let currentPage = 1;
	let totalPages = 0;
	let scale = 1.0;
	let canvas;
	let ctx;
	let selectedRedaction = null;
	let showRedactionPanel = true;
	let redactionStates = {};
	let isLoading = true;
	let renderTask = null;
	let currentPageObj = null;

	// Initialize PDF.js
	onMount(async () => {
		// Load PDF.js library if not already loaded
		if (!window.pdfjsLib) {
			await loadPDFJS();
		} else {
			await initializePDF();
		}
	});

	async function loadPDFJS() {
		return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
			
			script.onload = async () => {
				window.pdfjsLib.GlobalWorkerOptions.workerSrc =
					'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
				await initializePDF();
				resolve();
			};
			
			script.onerror = () => {
				console.error('Failed to load PDF.js');
				isLoading = false;
				reject();
			};
			
			document.head.appendChild(script);
		});
	}

	async function initializePDF() {
		try {
			// Convert base64 to Uint8Array
			const pdfDataBinary = atob(pdfData);
			const pdfDataArray = new Uint8Array(pdfDataBinary.length);
			for (let i = 0; i < pdfDataBinary.length; i++) {
				pdfDataArray[i] = pdfDataBinary.charCodeAt(i);
			}

			// Load the PDF document
			const loadingTask = window.pdfjsLib.getDocument({ data: pdfDataArray });
			pdfDoc = await loadingTask.promise;
			totalPages = pdfDoc.numPages;

			// Initialize redaction states
			redactionMetadata.forEach((r) => {
				redactionStates[r.id] = r.applied !== false;
			});

			// Initialize canvas context
			ctx = canvas.getContext('2d');
			
			// Render first page
			await renderPage();
			isLoading = false;
		} catch (error) {
			console.error('Error loading PDF:', error);
			isLoading = false;
		}
	}

	onDestroy(() => {
		// Clean up resources
		if (renderTask) {
			renderTask.cancel();
		}
		if (pdfDoc) {
			pdfDoc.destroy();
		}
	});

	async function renderPage() {
		if (!pdfDoc || !ctx || !canvas) return;

		// Cancel any ongoing render task
		if (renderTask) {
			try {
				renderTask.cancel();
			} catch (e) {
				// Ignore cancellation errors
			}
		}

		try {
			// Get the page
			currentPageObj = await pdfDoc.getPage(currentPage);
			
			// Get viewport
			const viewport = currentPageObj.getViewport({ scale });

			// Prepare canvas using PDF page dimensions
			const outputScale = window.devicePixelRatio || 1;
			canvas.width = Math.floor(viewport.width * outputScale);
			canvas.height = Math.floor(viewport.height * outputScale);
			canvas.style.width = Math.floor(viewport.width) + "px";
			canvas.style.height = Math.floor(viewport.height) + "px";

			// Clear canvas
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			const transform = outputScale !== 1
				? [outputScale, 0, 0, outputScale, 0, 0]
				: null;

			// Render PDF page
			const renderContext = {
				canvasContext: ctx,
				transform: transform,
				viewport: viewport
			};

			renderTask = currentPageObj.render(renderContext);
			await renderTask.promise;
			renderTask = null;

			// Draw redactions after page is rendered
			drawRedactionOverlays(viewport);
		} catch (error) {
			if (error.name !== 'RenderingCancelledException') {
				console.error('Error rendering page:', error);
			}
		}
	}

	function drawRedactionOverlays(viewport) {
		if (!ctx || !viewport) return;

		const pageRedactions = redactionMetadata.filter((r) => r.page === currentPage - 1);

		ctx.save();

		pageRedactions.forEach((redaction) => {
			if (redactionStates[redaction.id]) {
				// Set fill style to solid black
				ctx.fillStyle = '#000000';
				
				const [x0, y0, x1, y1] = redaction.bbox;
				
				// Transform coordinates from PDF space to canvas space
				const transform = viewport.transform;
				const outputScale = window.devicePixelRatio || 1;
				
				// Calculate canvas coordinates
				const canvasX = x0 * scale * outputScale;
				const canvasY = (viewport.height - y1) * outputScale;
				const canvasWidth = (x1 - x0) * scale * outputScale;
				const canvasHeight = (y1 - y0) * scale * outputScale;
				
				// Draw black rectangle
				ctx.fillRect(canvasX, canvasY, canvasWidth, canvasHeight);
			}
		});

		ctx.restore();
	}

	function changePage(delta) {
		const newPage = currentPage + delta;
		if (newPage >= 1 && newPage <= totalPages) {
			currentPage = newPage;
			renderPage();
		}
	}

	function changeScale(delta) {
		const newScale = Math.round((scale + delta) * 10) / 10;
		if (newScale >= 0.5 && newScale <= 2.0) {
			scale = newScale;
			renderPage();
		}
	}

	function fitToPage() {
		scale = 1.0;
		renderPage();
	}

	function toggleRedaction(redactionId) {
		redactionStates[redactionId] = !redactionStates[redactionId];
		renderPage();
	}

	function selectRedaction(redaction) {
		selectedRedaction = redaction;
		currentPage = redaction.page + 1;
		renderPage();
	}

	async function exportRedactedPDF() {
		const button = event.currentTarget;
		const originalText = button.textContent;
		button.textContent = 'Exporting...';
		button.disabled = true;

		try {
			// Prepare redaction data with current states
			const finalRedactions = redactionMetadata.map((r) => ({
				...r,
				applied: redactionStates[r.id]
			}));

			const response = await fetch('http://localhost:5000/apply_redactions', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					pdf_base64: pdfData,
					redactions: finalRedactions
				})
			});

			if (!response.ok) {
				throw new Error('Failed to export PDF');
			}

			const result = await response.json();

			if (result.success) {
				// Download the final PDF
				const pdfBlob = base64ToBlob(result.pdf_base64, 'application/pdf');
				const url = URL.createObjectURL(pdfBlob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `redacted_${fileName}`;
				a.click();
				URL.revokeObjectURL(url);
			} else {
				throw new Error(result.error || 'Export failed');
			}
		} catch (error) {
			console.error('Export error:', error);
			alert('Failed to export PDF: ' + error.message);
		} finally {
			button.textContent = originalText;
			button.disabled = false;
		}
	}

	function base64ToBlob(base64, type) {
		const binary = atob(base64);
		const array = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i++) {
			array[i] = binary.charCodeAt(i);
		}
		return new Blob([array], { type });
	}

	function handleCanvasClick(event) {
		if (!currentPageObj || !canvas) return;

		const rect = canvas.getBoundingClientRect();
		const x = (event.clientX - rect.left) * (canvas.width / rect.width) / scale;
		const y = (event.clientY - rect.top) * (canvas.height / rect.height) / scale;

		// Check if click is on a redaction
		const pageRedactions = redactionMetadata.filter((r) => r.page === currentPage - 1);
		for (const redaction of pageRedactions) {
			const [x0, y0, x1, y1] = redaction.bbox;
			// Check if click is within redaction bounds
			if (x >= x0 && x <= x1 && y >= y0 && y <= y1) {
				selectRedaction(redaction);
				break;
			}
		}
	}
</script>

<div class="fixed inset-0 bg-[var(--bg-primary)] z-50 flex flex-col">
	<!-- Toolbar -->
	<div class="bg-[var(--bg-secondary)] border-b border-[var(--border)] px-4 py-3 flex-shrink-0">
		<div class="flex items-center justify-between">
			<div class="flex items-center space-x-4">
				<button
					on:click={() => dispatch('close')}
					class="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors text-[var(--text-primary)]"
					title="Back to home"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M10 19l-7-7m0 0l7-7m-7 7h18"
						></path>
					</svg>
				</button>

				<h2 class="font-medium text-[var(--text-primary)]">{fileName}</h2>
			</div>

			<div class="flex items-center space-x-6">
				<!-- Page Navigation -->
				<div class="flex items-center space-x-2">
					<button
						on:click={() => changePage(-1)}
						disabled={currentPage <= 1 || isLoading}
						class="p-1.5 rounded hover:bg-[var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[var(--text-primary)]"
						title="Previous page"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							></path>
						</svg>
					</button>

					<span class="text-sm text-[var(--text-primary)] min-w-[100px] text-center">
						Page {currentPage} of {totalPages || '?'}
					</span>

					<button
						on:click={() => changePage(1)}
						disabled={currentPage >= totalPages || isLoading}
						class="p-1.5 rounded hover:bg-[var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[var(--text-primary)]"
						title="Next page"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
							></path>
						</svg>
					</button>
				</div>

				<!-- Zoom Controls -->
				<div class="flex items-center space-x-2 border-l border-[var(--border)] pl-6">
					<button
						on:click={() => changeScale(-0.1)}
						disabled={scale <= 0.5 || isLoading}
						class="p-1.5 rounded hover:bg-[var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[var(--text-primary)]"
						title="Zoom out"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"
							></path>
						</svg>
					</button>

					<button
						on:click={fitToPage}
						class="text-sm text-[var(--text-primary)] min-w-[50px] hover:text-[var(--accent)] transition-colors"
						title="Reset zoom"
					>
						{Math.round(scale * 100)}%
					</button>

					<button
						on:click={() => changeScale(0.1)}
						disabled={scale >= 2.0 || isLoading}
						class="p-1.5 rounded hover:bg-[var(--bg-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[var(--text-primary)]"
						title="Zoom in"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 4v16m8-8H4"
							></path>
						</svg>
					</button>
				</div>

				<!-- Actions -->
				<div class="flex items-center space-x-3 border-l border-[var(--border)] pl-6">
					<button
						on:click={() => (showRedactionPanel = !showRedactionPanel)}
						class="px-4 py-2 text-sm bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-lg hover:text-[var(--accent)] transition-colors"
					>
						{showRedactionPanel ? 'Hide' : 'Show'} Redactions
					</button>

					<button
						on:click={exportRedactedPDF}
						disabled={isLoading}
						class="px-4 py-2 text-sm bg-[var(--accent)] text-white rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
					>
						Export Redacted PDF
					</button>
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content Area -->
	<div class="flex-1 flex overflow-hidden">
		<!-- PDF Viewer -->
		<div class="flex-1 overflow-auto bg-[var(--bg-tertiary)] relative">
			{#if isLoading}
				<div class="absolute inset-0 flex items-center justify-center">
					<div class="text-center">
						<svg class="animate-spin h-10 w-10 mx-auto mb-4 text-[var(--accent)]" fill="none" viewBox="0 0 24 24">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						<p class="text-[var(--text-secondary)]">Loading PDF...</p>
					</div>
				</div>
			{/if}
			
			<div class="flex items-center justify-center min-h-full p-8">
				<div class="inline-block">
					<canvas
						bind:this={canvas}
						on:click={handleCanvasClick}
						class="shadow-2xl bg-white cursor-pointer"
					/>
				</div>
			</div>
		</div>

		<!-- Right Panel - Redaction List -->
		{#if showRedactionPanel}
			<div
				class="w-96 bg-[var(--bg-secondary)] border-l border-[var(--border)] flex flex-col overflow-hidden"
				transition:fly={{ x: 300, duration: 300 }}
			>
				<!-- Header -->
				<div class="p-4 border-b border-[var(--border)] flex-shrink-0">
					<h3 class="text-lg font-semibold text-[var(--text-primary)]">
						Redactions ({redactionMetadata.length})
					</h3>
					<p class="text-sm text-[var(--text-secondary)] mt-1">
						Click to navigate, toggle to show/hide
					</p>
				</div>

				<!-- Redaction List -->
				<div class="flex-1 overflow-y-auto p-4">
					<div class="space-y-3">
						{#each redactionMetadata as redaction}
							<div
								class="p-3 rounded-lg border transition-all cursor-pointer
								{selectedRedaction?.id === redaction.id
									? 'bg-[var(--accent)] bg-opacity-10 border-[var(--accent)]'
									: 'bg-[var(--bg-primary)] border-[var(--border)] hover:border-[var(--text-secondary)]'}"
								on:click={() => selectRedaction(redaction)}
							>
								<div class="flex items-start justify-between">
									<div class="flex-1 min-w-0">
										<div class="flex items-center space-x-2 mb-2">
											<span class="text-xs px-2 py-1 rounded bg-[var(--bg-tertiary)] text-[var(--text-primary)]">
												Page {redaction.page + 1}
											</span>
											<span
												class="text-xs px-2 py-1 rounded bg-[var(--warning)] bg-opacity-20 text-[var(--warning)]"
											>
												{redaction.type.replace(/_/g, ' ')}
											</span>
										</div>

										<div class="bg-[var(--bg-tertiary)] p-2 rounded mb-2">
											<p class="text-sm font-mono text-[var(--text-primary)] break-all">
												"{redaction.text}"
											</p>
										</div>

										<div class="space-y-1">
											<p class="text-xs text-[var(--accent)] font-medium">
												{redaction.legal_code}
											</p>
											<p class="text-xs text-[var(--text-secondary)] leading-relaxed">
												{redaction.reason}
											</p>
										</div>
									</div>

									<button
										on:click|stopPropagation={() => toggleRedaction(redaction.id)}
										class="ml-3 p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors flex-shrink-0"
										title={redactionStates[redaction.id] ? 'Click to show text' : 'Click to hide text'}
									>
										{#if redactionStates[redaction.id]}
											<svg
												class="w-5 h-5 text-[var(--error)]"
												fill="currentColor"
												viewBox="0 0 24 24"
											>
												<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
											</svg>
										{:else}
											<svg
												class="w-5 h-5 text-[var(--text-secondary)]"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
												></path>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
												></path>
											</svg>
										{/if}
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* Ensure proper canvas rendering */
	canvas {
		image-rendering: auto;
		image-rendering: crisp-edges;
		image-rendering: pixelated;
		image-rendering: -webkit-optimize-contrast;
	}

	/* Custom scrollbar for dark theme */
	:global(.dark) ::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}

	:global(.dark) ::-webkit-scrollbar-track {
		background: var(--bg-secondary);
	}

	:global(.dark) ::-webkit-scrollbar-thumb {
		background: var(--bg-tertiary);
		border-radius: 4px;
	}

	:global(.dark) ::-webkit-scrollbar-thumb:hover {
		background: var(--text-secondary);
	}
</style>
