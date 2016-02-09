<script>
	import get from 'mout/object/get'
	import set from 'mout/object/set'

	export default {
		data () {
			return {
				editable: {}
			}
		},
		methods: {
			toggleEditable (key, unique) {
				let editable = {}
				set(editable, key, !this.isEditable(key))
				this.$set('editable', Object.assign((unique ? {} : this.editable), editable))
			},
			isEditable (key) {
				return get(this.editable, key)
			},
			clearEditable () {
				this.editable = {}
			}
		}
	}
</script>