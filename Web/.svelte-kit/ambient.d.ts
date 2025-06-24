
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const SHELL: string;
	export const WINDOWID: string;
	export const __ETC_PROFILE_DONE: string;
	export const GHOSTTY_BIN_DIR: string;
	export const COLORTERM: string;
	export const XDG_CONFIG_DIRS: string;
	export const TERM_PROGRAM_VERSION: string;
	export const NVIM: string;
	export const LC_ADDRESS: string;
	export const LC_NAME: string;
	export const XCURSOR_PATH: string;
	export const NVIM_LOG_FILE: string;
	export const DESKTOP_SESSION: string;
	export const LC_MONETARY: string;
	export const GDK_PIXBUF_MODULE_FILE: string;
	export const NO_AT_BRIDGE: string;
	export const EDITOR: string;
	export const XDG_SEAT: string;
	export const PWD: string;
	export const NIX_PROFILES: string;
	export const LOGNAME: string;
	export const XDG_SESSION_DESKTOP: string;
	export const QT_QPA_PLATFORMTHEME: string;
	export const XDG_SESSION_TYPE: string;
	export const NIX_PATH: string;
	export const NIXPKGS_CONFIG: string;
	export const OMF_PATH: string;
	export const XAUTHORITY: string;
	export const QT_STYLE_OVERRIDE: string;
	export const WINDOWPATH: string;
	export const GDM_LANG: string;
	export const HOME: string;
	export const USERNAME: string;
	export const SSH_ASKPASS: string;
	export const LC_PAPER: string;
	export const LANG: string;
	export const LS_COLORS: string;
	export const _JAVA_AWT_WM_NONREPARENTING: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const VIMRUNTIME: string;
	export const GIO_EXTRA_MODULES: string;
	export const GTK_A11Y: string;
	export const NIX_USER_PROFILE_DIR: string;
	export const INFOPATH: string;
	export const VIM: string;
	export const GHOSTTY_RESOURCES_DIR: string;
	export const XDG_SESSION_CLASS: string;
	export const TERMINFO: string;
	export const LC_IDENTIFICATION: string;
	export const TERM: string;
	export const GTK_PATH: string;
	export const USER: string;
	export const NVIM_SYSTEM_RPLUGIN_MANIFEST: string;
	export const TZDIR: string;
	export const VISUAL: string;
	export const GHOSTTY_SHELL_INTEGRATION_NO_SUDO: string;
	export const DISPLAY: string;
	export const SHLVL: string;
	export const PAGER: string;
	export const LC_TELEPHONE: string;
	export const QTWEBKIT_PLUGIN_PATH: string;
	export const LC_MEASUREMENT: string;
	export const __NIXOS_SET_ENVIRONMENT_DONE: string;
	export const XDG_VTNR: string;
	export const XDG_SESSION_ID: string;
	export const LOCALE_ARCHIVE: string;
	export const LESSKEYIN_SYSTEM: string;
	export const GDM_X_SERVER_EXTRA_ARGS: string;
	export const TERMINFO_DIRS: string;
	export const LD_LIBRARY_PATH: string;
	export const XDG_RUNTIME_DIR: string;
	export const MYVIMRC: string;
	export const LC_TIME: string;
	export const LUA_CPATH: string;
	export const JOURNAL_STREAM: string;
	export const XDG_DATA_DIRS: string;
	export const LIBEXEC_PATH: string;
	export const PATH: string;
	export const GDMSESSION: string;
	export const SXHKD_SHELL: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const LUA_PATH: string;
	export const OMF_CONFIG: string;
	export const LC_NUMERIC: string;
	export const OLDPWD: string;
	export const TERM_PROGRAM: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		SHELL: string;
		WINDOWID: string;
		__ETC_PROFILE_DONE: string;
		GHOSTTY_BIN_DIR: string;
		COLORTERM: string;
		XDG_CONFIG_DIRS: string;
		TERM_PROGRAM_VERSION: string;
		NVIM: string;
		LC_ADDRESS: string;
		LC_NAME: string;
		XCURSOR_PATH: string;
		NVIM_LOG_FILE: string;
		DESKTOP_SESSION: string;
		LC_MONETARY: string;
		GDK_PIXBUF_MODULE_FILE: string;
		NO_AT_BRIDGE: string;
		EDITOR: string;
		XDG_SEAT: string;
		PWD: string;
		NIX_PROFILES: string;
		LOGNAME: string;
		XDG_SESSION_DESKTOP: string;
		QT_QPA_PLATFORMTHEME: string;
		XDG_SESSION_TYPE: string;
		NIX_PATH: string;
		NIXPKGS_CONFIG: string;
		OMF_PATH: string;
		XAUTHORITY: string;
		QT_STYLE_OVERRIDE: string;
		WINDOWPATH: string;
		GDM_LANG: string;
		HOME: string;
		USERNAME: string;
		SSH_ASKPASS: string;
		LC_PAPER: string;
		LANG: string;
		LS_COLORS: string;
		_JAVA_AWT_WM_NONREPARENTING: string;
		XDG_CURRENT_DESKTOP: string;
		VIMRUNTIME: string;
		GIO_EXTRA_MODULES: string;
		GTK_A11Y: string;
		NIX_USER_PROFILE_DIR: string;
		INFOPATH: string;
		VIM: string;
		GHOSTTY_RESOURCES_DIR: string;
		XDG_SESSION_CLASS: string;
		TERMINFO: string;
		LC_IDENTIFICATION: string;
		TERM: string;
		GTK_PATH: string;
		USER: string;
		NVIM_SYSTEM_RPLUGIN_MANIFEST: string;
		TZDIR: string;
		VISUAL: string;
		GHOSTTY_SHELL_INTEGRATION_NO_SUDO: string;
		DISPLAY: string;
		SHLVL: string;
		PAGER: string;
		LC_TELEPHONE: string;
		QTWEBKIT_PLUGIN_PATH: string;
		LC_MEASUREMENT: string;
		__NIXOS_SET_ENVIRONMENT_DONE: string;
		XDG_VTNR: string;
		XDG_SESSION_ID: string;
		LOCALE_ARCHIVE: string;
		LESSKEYIN_SYSTEM: string;
		GDM_X_SERVER_EXTRA_ARGS: string;
		TERMINFO_DIRS: string;
		LD_LIBRARY_PATH: string;
		XDG_RUNTIME_DIR: string;
		MYVIMRC: string;
		LC_TIME: string;
		LUA_CPATH: string;
		JOURNAL_STREAM: string;
		XDG_DATA_DIRS: string;
		LIBEXEC_PATH: string;
		PATH: string;
		GDMSESSION: string;
		SXHKD_SHELL: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		LUA_PATH: string;
		OMF_CONFIG: string;
		LC_NUMERIC: string;
		OLDPWD: string;
		TERM_PROGRAM: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
