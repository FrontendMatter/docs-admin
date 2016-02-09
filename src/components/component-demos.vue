<template>
	<div>
		<button type="button" class="btn btn-primary pull-right" data-toggle="modal" data-target="#add-demo">Add demo</button>
		<h3>Demos</h3>
	</div>
	<div class="list-group list-group-media" v-if="demos.length">
		<div class="list-group-item media" v-for="demo in demos">
			<div class="media-body">
				<a href="{{ demo.url }}" target="_blank">{{ demo.url }}</a>
			</div>
			<div class="media-right">
				<a href="#" @click.prevent="remove(demo)" class="text-danger"><i class="fa fa-trash"></i></a>
			</div>
		</div>
	</div>
	<div v-if="!serviceLoading && !demos.length" class="alert alert-default">No demos.</div>
	
	<!-- Add demo modal -->
	<modal id="add-demo"
		title="Add demo"
		@save.tk.modal="create"
		slide panel>
		<validator name="validation" slot="body">
			<form @submit.prevent="submit">
				<div class="form-group" 
					:class="{ 'has-error': hasValidationError('url') }">
					<label for="property-name">Demo URL</label>
					<input type="text" 
						class="form-control" 
						v-model="model.url" 
						v-validate:url="validateUrl"
						autofocus />
					<p class="help-block" v-if="hasValidationError('url')">{{ firstValidationMessage('url') }}</p>
				</div>
			</form>
		</validator>
	</modal>
	<!-- // END Add demo modal -->

</template>

<script>
	import Store from 'themekit-docs/src/mixins/store'
	import Validation from 'vue-validator-util'
	import { AlertNotification } from 'themekit-vue'
	import { Modal } from 'themekit-vue'

	export default {
		validators: {
			url: function (val) {
				return /^(http\:\/\/|https\:\/\/)(.{4,})$/.test(val)
			}
		},
		mixins: [
			Store,
			Validation,
			AlertNotification
		],
		data () {
			return {
				model: null,
				modal: null,
				demos: []
			}
		},
		props: {
			component: {
				type: Object,
				required: true
			}
		},
		computed: {
			componentId () {
				return this.component.componentIdData.objectID
			},
			version () {
				return this.$route.params.version
			},
			validateUrl () {
				return { 
					required: { rule: true, message: 'The demo URL is required' },
					url: { rule: 'url', message: 'The demo URL has to be a valid URL' }
				}
			}
		},
		methods: {
			create ({ abort, next }) {
				this.didSubmit = true
				if (this.getValidator().invalid) {
					return abort('save')
				}

				this.save()
				next('save')
			},
			save () {
				const ref = this.store.getRefComponentDemo(this.componentId).push()
				const objectID = ref.key()
				this.store.set(ref, this.model).then(() => {
					this.model.objectID = objectID
					this.demos.push(this.model)
					this.alertNotificationSuccess('The demo was saved.')
					this.didSubmit = false
					this.model = {}
				})
			},
			submit () {
				if (this.modal) {
					this.modal.save()
				}
			},
			remove (demo) {
				if (confirm('Are you sure you want to remove this demo?')) {
					const ref = this.store.getRefComponentDemo(this.componentId).child(demo.objectID)
					this.store.remove(ref).then(() => {
						this.demos.$remove(demo)
					})
				}
			},
			updateDemos () {
				if (this.component && !this.demos.length) {
					this.demos = this.component.demos
				}
			}
		},
		created () {
			this.updateDemos()
		},
		watch: {
			'component': 'updateDemos'
		},
		events: {
			'ready.tk.modal': function (modal) {
				this.modal = modal
			}
		},
		components: {
			Modal
		}
	}
</script>