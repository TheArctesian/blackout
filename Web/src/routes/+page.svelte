<script>
  import { onMount } from "svelte";

  import PDFViewer from "./PDFViewer.svelte";

  let isDarkMode = true;

  let isUploading = false;

  let isDragging = false;

  let fileName = "";

  let error = "";

  let success = false;

  let showViewer = false;

  let pdfData = null;

  let redactionMetadata = [];

  const API_URL = "http://localhost:5000";

  onMount(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      isDarkMode = savedTheme === "dark";
    }

    updateTheme();
  });

  function updateTheme() {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    localStorage.setItem("theme", isDarkMode ? "dark" : "light");
  }

  function toggleTheme() {
    isDarkMode = !isDarkMode;

    updateTheme();
  }

  function handleDragOver(e) {
    e.preventDefault();

    isDragging = true;
  }

  function handleDragLeave(e) {
    e.preventDefault();

    isDragging = false;
  }

  async function handleDrop(e) {
    e.preventDefault();

    isDragging = false;

    const files = e.dataTransfer.files;

    if (files.length > 0) {
      await processFile(files[0]);
    }
  }

  async function handleFileSelect(e) {
    const files = e.target.files;

    if (files.length > 0) {
      await processFile(files[0]);
    }
  }

  async function processFile(file) {
    if (file.type !== "application/pdf") {
      error = "Please upload a PDF file";

      return;
    }

    fileName = file.name;

    error = "";

    success = false;

    isUploading = true;

    const formData = new FormData();

    formData.append("file", file);

    try {
      const response = await fetch(`${API_URL}/redact`, {
        method: "POST",

        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to redact document");
      }

      const result = await response.json();

      if (result.success) {
        pdfData = result.pdf_base64;

        redactionMetadata = result.redactions;

        showViewer = true;

        success = true;
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (err) {
      error = err.message || "An error occurred while processing the file";
    } finally {
      isUploading = false;
    }
  }

  function handleCloseViewer() {
    showViewer = false;

    pdfData = null;

    redactionMetadata = [];

    fileName = "";
  }
</script>

{#if showViewer}
  <PDFViewer
    {pdfData}
    {redactionMetadata}
    {fileName}
    on:close={handleCloseViewer}
  />
{:else}
  <div
    class="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300"
  >
    <!-- Header -->
    <header class="border-b border-[var(--border)]">
      <div
        class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center"
      >
        <div class="flex items-center space-x-3">
          <svg
            class="w-8 h-8 text-[var(--accent)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
          <h1 class="text-2xl font-bold">California Legal Document Redactor</h1>
        </div>
        <button
          on:click={toggleTheme}
          class="p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          {#if isDarkMode}
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              ></path>
            </svg>
          {:else}
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              ></path>
            </svg>
          {/if}
        </button>
      </div>
    </header>
    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-6 py-12">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-semibold mb-4">
          Legal Document Redaction System
        </h2>
        <p class="text-[var(--text-secondary)] text-lg">
          Automatically redact sensitive information according to California law
          with full legal citations
        </p>
      </div>

      <!-- Upload Area -->
      <div
        class="relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 {isDragging
          ? 'border-[var(--accent)] bg-[var(--bg-secondary)]'
          : 'border-[var(--border)]'}"
        on:dragover={handleDragOver}
        on:dragleave={handleDragLeave}
        on:drop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf"
          on:change={handleFileSelect}
          class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <svg
          class="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          ></path>
        </svg>

        {#if isUploading}
          <div class="flex items-center justify-center space-x-2">
            <svg
              class="animate-spin h-5 w-5 text-[var(--accent)]"
              fill="none"
              viewBox="0 0 24 24"
            >
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
            <span>Processing document...</span>
          </div>
        {:else}
          <p class="text-lg mb-2">Drop your PDF here or click to browse</p>
          <p class="text-sm text-[var(--text-secondary)]">
            Maximum file size: 50MB
          </p>
        {/if}
      </div>

      <!-- Status Messages -->
      {#if fileName && !error && !showViewer}
        <div class="mt-6 p-4 bg-[var(--bg-secondary)] rounded-lg">
          <p class="text-sm">
            Selected file: <span class="font-medium">{fileName}</span>
          </p>
        </div>
      {/if}

      {#if error}
        <div
          class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-[var(--error)] rounded-lg"
        >
          <p class="text-[var(--error)]">{error}</p>
        </div>
      {/if}

      <!-- Legal Info Section -->
      <div class="mt-12 grid md:grid-cols-2 gap-6">
        <div class="bg-[var(--bg-secondary)] rounded-lg p-6">
          <h3 class="font-semibold text-lg mb-3 text-[var(--accent)]">
            Automated Redactions
          </h3>
          <ul class="space-y-2 text-sm text-[var(--text-secondary)]">
            <li>• SSN (Civil Code § 1798.3)</li>
            <li>• Driver's License (Gov Code § 6254)</li>
            <li>• Minor Information (W&I Code § 827)</li>
            <li>• Victim Names (Penal Code § 293)</li>
            <li>• Medical Records (H&S Code § 123100)</li>
            <li>• Financial Information (Civil Code § 1798.3)</li>
          </ul>
        </div>

        <div class="bg-[var(--bg-secondary)] rounded-lg p-6">
          <h3 class="font-semibold text-lg mb-3 text-[var(--accent)]">
            Interactive Features
          </h3>
          <ul class="space-y-2 text-sm text-[var(--text-secondary)]">
            <li>• View legal citations for each redaction</li>
            <li>• Toggle redactions on/off</li>
            <li>• Add custom redactions</li>
            <li>• Export final redacted version</li>
            <li>• Full compliance with CA Rules of Court</li>
            <li>• Detailed redaction report</li>
          </ul>
        </div>
      </div>
    </main>
  </div>
{/if}

<style>
  :global(html) {
    transition: background-color 0.3s ease;
  }

  :global(.dark) {
    --bg-primary: #1d1f21;

    --bg-secondary: #282a2e;

    --bg-tertiary: #373b41;

    --text-primary: #c5c8c6;

    --text-secondary: #969896;

    --accent: #81a2be;

    --success: #b5bd68;

    --error: #cc6666;

    --warning: #f0c674;

    --border: #373b41;
  }

  :global(html:not(.dark)) {
    --bg-primary: #ffffff;

    --bg-secondary: #f7f7f7;

    --bg-tertiary: #e8e8e8;

    --text-primary: #1d1f21;

    --text-secondary: #4b5563;

    --accent: #4d7aa7;

    --success: #90a959;

    --error: #a54242;

    --warning: #eab700;

    --border: #d1d5db;
  }
</style>
