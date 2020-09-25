//= require_self
//= require j3_autocomplete

$.fn.j3_progress = function() {
  $(this).html($('<div class="spinner-grow m-2" style="width: 2rem; height: 2rem;" role="status"><span class="sr-only">Loading...</span></div>'))
}