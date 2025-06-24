export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.png"]),
	mimeTypes: {".png":"image/png"},
	_: {
		client: {start:"_app/immutable/entry/start.8g51IE4x.js",app:"_app/immutable/entry/app.CtA8gIbV.js",imports:["_app/immutable/entry/start.8g51IE4x.js","_app/immutable/chunks/GKHZdr0z.js","_app/immutable/chunks/DXztHuL0.js","_app/immutable/chunks/SRFr5ngH.js","_app/immutable/entry/app.CtA8gIbV.js","_app/immutable/chunks/DXztHuL0.js","_app/immutable/chunks/CPVcxQeY.js","_app/immutable/chunks/q6A3s4Ef.js","_app/immutable/chunks/SRFr5ngH.js","_app/immutable/chunks/Bs8ixgpK.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('../output/server/nodes/0.js')),
			__memo(() => import('../output/server/nodes/1.js')),
			__memo(() => import('../output/server/nodes/2.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
