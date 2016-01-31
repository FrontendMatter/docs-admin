/* eslint no-undef:0 */
function routeToPackage (routeName, packageId, version = 'latest') {
	return {
		name: routeName,
		params: {
			id: packageId,
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
		components: null
	},
	helpers: {
		routeToEditComponent (packageId, componentId) {
			return {
				name: 'package.edit.component',
				params: {
					id: packageId,
					componentId
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
		routeToEditPackage (packageId, version) {
			return routeToPackage('package.edit', packageId, version)
		},
		routeToPackageComponents (packageId, version) {
			return routeToPackage('package.components', packageId, version)
		},
		routeToPackagePages (packageId, version) {
			return routeToPackage('package.pages', packageId, version)
		},
		routeToCreateComponent (packageId, version) {
			return routeToPackage('package.create.component', packageId, version)
		},
		routeToCreatePage (packageId, version) {
			return routeToPackage('package.create.page', packageId, version)
		},
		routeToEditPage (packageId, pageId, version = 'latest') {
			return {
				name: 'package.edit.page',
				params: {
					id: packageId,
					pageId,
					version
				}
			}
		}
	}
}