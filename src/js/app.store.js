/* eslint no-undef:0 */
function routeToPackage (routeName, packageName, version = 'latest') {
	return {
		name: routeName,
		params: {
			packageName,
			version
		}
	}
}
export default {
	config: {
		algolia: {
			appId: __APP__.algolia.appId,
			apiKey: __APP__.algolia.apiKey
		},
		storeFirebaseRef: __APP__.storeFirebaseRef,
		marked: {
			highlight: function (code) {
				return require('highlight.js').highlightAuto(code).value
			}
		}
	},
	state: {
		components: null,
		pkg: null,
		versions: null
	},
	helpers: {
		routeToEditComponent (packageName, componentName, version) {
			return {
				name: 'package.edit.component',
				params: {
					packageName,
					componentName,
					version
				}
			}
		},
		routeToPackages () {
			return {
				name: 'packages'
			}
		},
		routeToCreatePackage () {
			return {
				name: 'package.create'
			}
		},
		routeToEditPackage (packageName, version) {
			return routeToPackage('package.edit', packageName, version)
		},
		routeToPackageComponents (packageName, version) {
			return routeToPackage('package.components', packageName, version)
		},
		routeToPackagePages (packageName, version) {
			return routeToPackage('package.pages', packageName, version)
		},
		routeToCreateComponent (packageName, version) {
			return routeToPackage('package.create.component', packageName, version)
		},
		routeToCreatePage (packageName, version) {
			return routeToPackage('package.create.page', packageName, version)
		},
		routeToEditPage (packageName, version = 'latest', pageId) {
			return {
				name: 'package.edit.page',
				params: {
					packageName,
					version,
					pageId
				}
			}
		}
	}
}