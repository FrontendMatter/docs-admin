import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

var router = new VueRouter({
	linkActiveClass: 'active'
})

import appStore from 'themekit-docs/src/js/app.store'
import user from 'vue-firebase-auth/lib/user'
user.setRef(appStore.config.storeFirebaseRef)

router.map({
	'/auth': {
		name: 'auth',
		component: function (resolve) {
			require(['../views/auth'], resolve)
		}
	},
	'/logout': {
		name: 'logout',
		component: function (resolve) {
			require(['../views/logout'], resolve)
		}
	},
	'/packages': {
		name: 'packages',
		component: function (resolve) {
			require(['../views/packages/index'], resolve)
		}
	},
	'/packages/create': {
		name: 'package.create',
		component: function (resolve) {
			require(['../views/package/package'], resolve)
		}
	},
	'/packages/edit/:id': {
		name: 'package.edit',
		component: function (resolve) {
			require(['../views/package/package'], resolve)
		}
	},
	'/packages/:id': {
		name: 'package.components',
		component: function (resolve) {
			require(['../views/package/components'], resolve)
		}
	},
	'/packages/:id/components/create': {
		name: 'package.create.component',
		component: function (resolve) {
			require(['../views/package/component'], resolve)
		}
	},
	'/packages/:id/components/edit/:componentId': {
		name: 'package.edit.component',
		component: function (resolve) {
			require(['../views/package/component'], resolve)
		}
	},
	'/packages/:id/pages': {
		name: 'package.pages',
		component: function (resolve) {
			require(['../views/package/pages'], resolve)
		}
	},
	'/packages/:id/pages/create': {
		name: 'package.create.page',
		component: function (resolve) {
			require(['../views/package/page'], resolve)
		}
	},
	'/packages/:id/pages/edit/:pageId': {
		name: 'package.edit.page',
		component: function (resolve) {
			require(['../views/package/page'], resolve)
		}
	}
})

router.beforeEach(({ to, next }) => {
	const auth = user.getAuth()

	if (to.name !== 'auth' && !auth) {
		router.go('auth')
	}
	else if (to.name === 'auth' && auth) {
		router.go('packages')
	}
	else {
		next()
		window.scrollTo(0, 0)
	}
})

router.redirect({
	'*': '/packages'
})

export default router