module.exports = function (api) {
	api.cache(true);
	return {
		presets: [
			"babel-preset-expo",
			[
				"@babel/preset-env",
				{
					useBuiltIns: "usage",
					corejs: 3,
					targets: {
						node: "current",
						browsers: [">0.25%", "not dead", "not ie 11", "not op_mini all"],
					},
				},
			],
			"@babel/preset-react",
			"@babel/preset-typescript",
		],
		plugins: [
			"@babel/plugin-proposal-export-namespace-from",
			"react-native-reanimated/plugin",
			[
				"@babel/plugin-proposal-class-properties",
				{
					loose: true,
				},
			],
			[
				"@babel/plugin-proposal-private-methods",
				{
					loose: true,
				},
			],
			[
				"@babel/plugin-proposal-private-property-in-object",
				{
					loose: true,
				},
			],
			[
				"module:react-native-dotenv",
				{
					moduleName: "@env",
					path: ".env",
					safe: false,
					allowUndefined: true,
				},
			],
			[
				"@babel/plugin-transform-runtime",
				{
					regenerator: true,
					helpers: true,
				},
			],
			[
				"module-resolver",
				{
					root: ["./src"],
					extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
					alias: {
						"@/": "./src/",
					},
				},
			],
		],
		env: {
			production: {
				plugins: ["transform-remove-console"],
			},
		},
	};
};
