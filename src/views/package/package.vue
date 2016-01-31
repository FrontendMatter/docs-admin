<template>
	<tabs>
		<tab-pane active label="Edit package">

			<!-- Loading -->
			<div class="alert alert-default" v-if="serviceLoading">Loading data ...</div>
			
			<!-- Main form -->
			<form @submit.prevent="create" v-show="!serviceLoading">
				<validator name="validation">
					<div class="page-header">
						<div class="pull-right">
							<button type="button" class="btn btn-link" @click="cancel">Cancel</button>
							<button type="submit" class="btn btn-success">Save</button>
						</div>
						<h1 v-text="isEditView ? 'Edit package' : 'Create package'"></h1>
					</div>

					<div class="form-group" 
						:class="{ 'has-error': hasValidationError('name') }">
						<label for="name">Package name</label>
						<input type="text" 
							id="name"
							class="form-control" 
							v-model="model.name" 
							v-validate:name="{ required: { rule: true, message: 'The package name is required' } }"
							:autofocus="!isEditView" />
						<p class="help-block" v-for="msg in validationMessages('name')">{{ msg }}</p>
					</div>
				</validator>

				<div class="form-group">
					<label for="content">Content</label>
					<markdown-editor :model.sync="model.content"></markdown-editor>
				</div>
				
				<!-- Main form controls -->
				<div class="form-group">
					<button type="submit" class="btn btn-success">Save</button>
					<button type="button" class="btn btn-link" @click="cancel">Cancel</button>
				</div>
			</form>
			<!-- // END Main form -->

		</tab-pane>
		<tab-pane :visible="isEditView" id="versions" label="Versions">
			<package-versions v-if="isEditView && activeTab === 'versions'"></package-versions>
		</tab-pane>
	</tabs>
</template>

<script>
	import appStore from 'themekit-docs/src/js/app.store'
	import Store from 'themekit-docs/src/mixins/store'
	import PackageVersions from 'themekit-docs/src/components/package-versions'
	import Validation from 'vue-validator-util'
	import { AlertNotification } from 'themekit-vue'
	import { MarkdownEditor } from 'vue-markdown-editor'
	import { Tabs, TabPane } from 'themekit-vue'
	import merge from 'mout/object/merge'
	
	export default {
		mixins: [
			Store,
			Validation,
			AlertNotification
		],
		data () {
			return {
				appHelpers: appStore.helpers,

				// main form model
				model: {
					name: null,
					content: null
				},

				activeTab: null
			}
		},
		route: {
			canReuse: false
		},
		computed: {
			packageId () {
				return this.$route.params.id
			},
			version () {
				return this.$route.params.version || 'latest'
			},
			isEditView () {
				return this.packageId !== undefined
			},
			valid () {
				return this.$validation.valid
			}
		},
		methods: {
			create () {
				this.didSubmit = true
				if (this.valid) {
					this.store.setPackage(this.packageId, this.model, this.version).then((objectId) => {
						if (!this.model.objectId) {
							this.model.objectId = objectId
						}
						this.didSubmit = false
						this.success('The package was saved.')
					})
				}
			},
			goToPackages () {
				this.$router.go(this.appHelpers.routeToPackages())
			},
			goToEditPackage () {
				this.$router.go(this.appHelpers.routeToEditPackage(this.model.objectId, this.version))
			},
			cancel () {
				this.goToPackages()
			},
			success (message) {
				this.alertNotificationSuccess(message)
				if (!this.isEditView) {
					this.goToEditPackage()
				}
			}
		},
		created () {
			const mergeModel = {
				version: this.version
			}
			if (this.isEditView) {
				this.store.getPackage(this.packageId, this.version).then((data) => {
					this.model = merge(this.model, data, mergeModel)
				})
			}
			else {
				this.model = merge(this.model, mergeModel)
			}
		},
		events: {
			'show.tk.tab': function (tab) {
				this.activeTab = tab
			}
		},
		components: {
			MarkdownEditor,
			PackageVersions,
			Tabs,
			TabPane
		}
	}
</script>
