import { d as attr_class, f as attr, c as pop, p as push, h as stringify } from "../../chunks/index.js";
function _page($$payload, $$props) {
  push();
  let isUploading = false;
  {
    $$payload.out += "<!--[!-->";
    $$payload.out += `<div class="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300"><header class="border-b border-[var(--border)]"><div class="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center"><div class="flex items-center space-x-3"><svg class="w-8 h-8 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> <h1 class="text-2xl font-bold">California Legal Document Redactor</h1></div> <button class="p-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors">`;
    {
      $$payload.out += "<!--[-->";
      $$payload.out += `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`;
    }
    $$payload.out += `<!--]--></button></div></header> <main class="max-w-4xl mx-auto px-6 py-12"><div class="text-center mb-8"><h2 class="text-3xl font-semibold mb-4">Legal Document Redaction System</h2> <p class="text-[var(--text-secondary)] text-lg">Automatically redact sensitive information according to California law with full legal
					citations</p></div> <div${attr_class(`relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${stringify("border-[var(--border)]")}`)}><input type="file" accept=".pdf" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"${attr("disabled", isUploading, true)}/> <svg class="w-16 h-16 mx-auto mb-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg> `;
    {
      $$payload.out += "<!--[!-->";
      $$payload.out += `<p class="text-lg mb-2">Drop your PDF here or click to browse</p> <p class="text-sm text-[var(--text-secondary)]">Maximum file size: 50MB</p>`;
    }
    $$payload.out += `<!--]--></div> `;
    {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--> `;
    {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--> <div class="mt-12 grid md:grid-cols-2 gap-6"><div class="bg-[var(--bg-secondary)] rounded-lg p-6"><h3 class="font-semibold text-lg mb-3 text-[var(--accent)]">Automated Redactions</h3> <ul class="space-y-2 text-sm text-[var(--text-secondary)]"><li>• SSN (Civil Code § 1798.3)</li> <li>• Driver's License (Gov Code § 6254)</li> <li>• Minor Information (W&amp;I Code § 827)</li> <li>• Victim Names (Penal Code § 293)</li> <li>• Medical Records (H&amp;S Code § 123100)</li> <li>• Financial Information (Civil Code § 1798.3)</li></ul></div> <div class="bg-[var(--bg-secondary)] rounded-lg p-6"><h3 class="font-semibold text-lg mb-3 text-[var(--accent)]">Interactive Features</h3> <ul class="space-y-2 text-sm text-[var(--text-secondary)]"><li>• View legal citations for each redaction</li> <li>• Toggle redactions on/off</li> <li>• Add custom redactions</li> <li>• Export final redacted version</li> <li>• Full compliance with CA Rules of Court</li> <li>• Detailed redaction report</li></ul></div></div></main></div>`;
  }
  $$payload.out += `<!--]-->`;
  pop();
}
export {
  _page as default
};
