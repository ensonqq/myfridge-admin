<template>

</template>
<script>
import Swal           from 'sweetalert2';
import {Button, Card} from 'src/components/UIComponents';

export default {
  components : {
    [Button.name] : Button,
    Card
  },
  methods    : {
    open (title, message) {
      const swalWithBootstrapButtons6 = Swal.mixin({
        customClass    : {
          confirmButton : "btn btn-error",
          cancelButton  : "btn btn-default",
        },
        buttonsStyling : false,
      });

      return swalWithBootstrapButtons6.fire({
        title             : title,
        text              : message,
        confirmButtonText : "確定",
        cancelButtonText  : "取消",
        showCancelButton  : true,
      })

    }
  }
}
</script>
<style>
</style>
