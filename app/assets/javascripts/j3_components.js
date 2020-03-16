//= require_self
//= require j3_autocomplete

$.fn.j3_progress = function() {
  $(this).append($('<div class="spinner-grow" style="width: 3rem; height: 3rem;" role="status"><span class="sr-only">Loading...</span></div>'))
}