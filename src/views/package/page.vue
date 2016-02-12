<template>

	<div class="page-header">
		<h1 v-text="isEditView ? 'Edit page' : 'Create page'"></h1>
		<span v-if="page" class="label label-default">{{ page.packageVersionIdData.version }}</span>
	</div>

	<!-- Loading -->
	<div class="alert alert-default" v-if="serviceLoading">Loading data ...</div>
	
	<!-- Main form -->
	<form @submit.prevent="save" v-show="(!serviceLoading && !isEditView) || page">
		<validator name="validation">

			<div class="form-group" 
				:class="{ 'has-error': hasValidationError('title') }">
				<label for="title">Page title</label>
				<input type="text" 
					id="title"
					class="form-control" 
					v-model="model.title" 
					v-validate:title="{ required: { rule: true, message: 'The page title is required' } }"
					:autofocus="!isEditView"  />
				<p class="help-block" v-if="hasValidationError('title')">{{ firstValidationMessage('title') }}</p>
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

			<p class="help-block" v-if="hasValidationError('content', 'contentValidator')">{{ firstValidationMessage('content', 'contentValidator') }}</p>
		</div>
		
		<!-- Main form controls -->
		<div class="form-group">
			<button type="submit" class="btn btn-success">Save</button>
			<button type="button" class="btn btn-link" @click="cancel">Cancel</button>
		</div>
	</form>
	<!-- // END Main form -->

</template>

<script>
	import appStore from 'themekit-docs/src/js/app.store'
	import Store from 'themekit-docs/src/mixins/store'
	import Validation from 'vue-validator-util'
	import { AlertNotification } from 'themekit-vue'
	import { MarkdownEditor } from 'vue-markdown-editor'
	import slugify from 'mout/string/slugify'
	
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
				appState: appStore.state,
				model: {
					title: null,
					slug: null,
					content: null
				},
				page: null,
				contentValidator: null,
				createPageId: null
			}
		},
		computed: {
			packageName () {
				return this.$route.params.packageName
			},
			version () {
				return this.$route.params.version
			},
			packageVersionId () {
				if (this.appState.pkg) {
					return this.appState.pkg.packageVersionIdData.objectID
				}
			},
			pageId () {
				return this.$route.params.pageId
			},
			isEditView () {
				return this.pageId !== undefined
			},
			valid () {
				return this.$validation.valid && this.contentValidator.valid
			}
		},
		methods: {
			save () {
				this.didSubmit = true
				if (this.valid) {
					this.model.slug = slugify(this.model.title)
					this.store.setPackagePage(this.packageVersionId, this.pageId, this.model).then((pageId) => {
						if (!this.isEditView) {
							this.createPageId = pageId
						}
						this.didSubmit = false
						this.success('The page was saved.')
					})
				}
			},
			goToPackage () {
				this.$router.go(this.appHelpers.routeToPackagePages(this.packageName, this.version))
			},
			goToEditPage () {
				this.$router.go(this.appHelpers.routeToEditPage(this.packageName, this.version, this.createPageId))
			},
			cancel () {
				this.goToPackage()
			},
			success (message) {
				this.alertNotificationSuccess(message)
				if (!this.isEditView) {
					return this.goToEditPage()
				}
				this.getPage()
			},
			getPage () {
				if (this.isEditView) {
					this.store.getPackagePage(this.packageName, this.version, this.pageId).then((page) => this.page = page)
				}
			}
		},
		created () {
			this.getPage()
		},
		watch: {
			page (value) {
				if (value && value.data) {
					this.model = value.data
				}
			},
			packageVersionId: 'getPage'
		},
		components: {
			MarkdownEditor
		}
	}
</script>
