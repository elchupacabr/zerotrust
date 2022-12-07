<notifications group="foo" />
 
<button class="btn" @click="show('foo')">click me</button>
 
<script>
this.$notify({
  group: 'foo',
  title: 'Important message',
  text: 'Hello user! This is a notification!'
});
</script>
