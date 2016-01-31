<template>

	<!-- Loading -->
	<div class="alert alert-default" v-if="serviceLoading">Loading data ...</div>
	
	<template v-if="!serviceLoading">

		<!-- Main form -->
		<form @submit.prevent="create">
			<validator name="validation">
				<div class="page-header">
					<div class="pull-right">
						<button type="button" class="btn btn-link" @click="cancel">Cancel</button>
						<button type="submit" class="btn btn-success">Save</button>
					</div>
					<h1 v-text="isEditView ? 'Edit page' : 'Create page'"></h1>
				</div>

				<div class="form-group" 
					:class="{ 'has-error': hasValidationError('title') }">
					<label for="title">Page title</label>
					<input type="text" 
						id="title"
						class="form-control" 
						v-model="model.title" 
						v-validate:title="{ required: { rule: true, message: 'The page title is required' } }"
						:autofocus="!isEditView"  />
					<p class="help-block" v-for="msg in validationMessages('title')">{{ msg }}</p>
				</div>
			</validator>

			<div class="form-group" 
				:class="{ 'has-error': hasValidationError('content', 'contentValidator') }">
				<label for="content">Content</label>

				<markdown-editor
					:model.sync="model.content"
					:validator.sync="contentValidator"
					:marked-options="appConfig.marked">
				</markdown-editor>

				<p class="help-block" v-for="msg in validationMessages('content', 'contentValidator')">{{ msg }}</p>
			</div>
			
			<!-- Main form controls -->
			<div class="form-group">
				<button type="submit" class="btn btn-success">Save</button>
				<button type="button" class="btn btn-link" @click="cancel">Cancel</button>
			</div>
		</form>
		<!-- // END Main form -->

	</template>

</template>

<script>
	import appStore from 'themekit-docs/src/js/app.store'
	import Store from 'themekit-docs/src/mixins/store'
	import Validation from 'vue-validator-util'
	import { AlertNotification } from 'themekit-vue'
	import { MarkdownEditor } from 'vue-markdown-editor'
	import slugify from 'mout/string/slugify'
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
				appConfig: appStore.config,

				// main form model
				model: {
					packageId: null,
					version: null,
					title: null,
					content: null,
					slug: null
				},

				contentValidator: null
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
				return this.$route.params.version
			},
			pageId () {
				return this.$route.params.pageId
			},
			isEditView () {
				return this.pageId
			},
			valid () {
				return this.$validation.valid && this.contentValidator.valid
			}
		},
		methods: {
			create () {
				this.didSubmit = true
				if (this.valid) {
					this.model.slug = slugify(this.model.title)
					this.store.setPage(this.pageId, this.model, this.version).then((objectId) => {
						if (!this.model.objectId) {
							this.model.objectId = objectId
						}
						this.didSubmit = false
						this.success('The page was saved.')
					})
				}
			},
			goToPackage () {
				this.$router.go(this.appHelpers.routeToPackagePages(this.packageId, this.version))
			},
			goToEditPage () {
				this.$router.go(this.appHelpers.routeToEditPage(this.packageId, this.model.objectId, this.version))
			},
			cancel () {
				this.goToPackage()
			},
			success (message) {
				this.alertNotificationSuccess(message)
				if (!this.isEditView) {
					this.goToEditPage()
				}
			}
		},
		created () {
			const mergeModel = {
				packageId: this.packageId,
				version: this.version
			}
			if (this.isEditView) {
				this.store.getPage(this.pageId, this.version).then((page) => {
					this.model = merge(page, mergeModel)
				})
			}
			else {
				this.model = merge(this.model, mergeModel)
			}
		},
		components: {
			MarkdownEditor
		}
	}
</script>
