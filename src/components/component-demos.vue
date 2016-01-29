<template>
	<div>
		<button type="button" class="btn btn-primary pull-right" data-toggle="modal" data-target="#add-demo">Add demo</button>
		<h2>Demos</h2>
	</div>
	<div class="list-group list-group-demos" v-if="demos.length">
		<div class="list-group-item media" v-for="demo in demos">
			<div class="media-body">
				<a href="{{ demo.url }}" target="_blank">{{ demo.url }}</a>
			</div>
			<div class="media-right">
				<a href="#" @click.prevent="remove(demo)" class="text-danger"><i class="fa fa-trash"></i></a>
			</div>
		</div>
	</div>
	<div v-else class="alert alert-default">
		No demos.
	</div>
	
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
			componentId: {
				type: String,
				required: true
			}
		},
		computed: {
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
				const ref = this.store.componentDemosRef(this.componentId).push()
				this.store.set(ref, this.model).then((objectId) => {
					this.model.objectId = objectId
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
					const ref = this.store.componentDemosRef(this.componentId).child(demo.objectId)
					this.store.remove(ref).then(() => {
						this.demos.$remove(demo)
					})
				}
			}
		},
		created () {
			if (this.componentId) {
				this.store.getComponentDemos(this.componentId).then((demos) => {
					demos.map((demo) => {
						const exists = this.demos.find((d) => d.demoId === demo.demoId)
						if (!exists) {
							this.demos.push(demo)
						}
					})
				})
			}
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

<style lang="sass">
	.list-group-demos {
		.list-group-item {
			margin-top: 0
		}
	}
</style>