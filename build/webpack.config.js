var webpack = require('webpack')
var WebpackConfig = require('themekit-webpack-config')
var config = require('config')
var path = require('path')

module.exports = new WebpackConfig()
	.withEntry('js/main.js')
	.withEntry('js/vendor.js')
	.withAlias({ 'themekit-docs': path.resolve(__dirname, '..') })
	.webpack({
		plugins: [
			new webpack.DefinePlugin({
				__APP__: {
					algolia: {
						appId: JSON.stringify(config.get('algolia.appId')),
						apiKey: JSON.stringify(config.get('algolia.apiKey'))
					},
					storeFirebaseRef: JSON.stringify(config.get('storeFirebaseRef'))
				}
			})
		]
	})
	.use('extract')
	.use('commons')
	.use('bower')
	.use('vendor')