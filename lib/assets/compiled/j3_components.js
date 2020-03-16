$(() => {
  // Auto init j3_autocomplete component
  $('.j3_autocomplete').each((_index, object) => {
    $(object).j3_autocomplete()
  })
})

// JQuery plugin for j3_autocomplete component
$.fn.j3_autocomplete = function() {
  let dropdown = $(this)
  if (j3_autocomplete__isEnabled(dropdown)) {
    dropdown.removeClass('d-none')
    j3_autocomplete__clear(dropdown)
    dropdown.off('show.bs.dropdown').on('show.bs.dropdown', () => j3_autocomplete__init(dropdown))
  } else {
    // add disabled class
    dropdown.addClass('d-none')
  }
}

// Init dropdown events and load results
const j3_autocomplete__init = (dropdown) => {
  // Puts progress
  let autocompleteResults = dropdown.find('.dropdown-menu .autocomplete-results')
  autocompleteResults.html(window.createProgressIndeterminate())

  // Call URL
  j3_autocomplete__getResults(autocompleteResults, dropdown)
}

// Check URL param exists, add search query if not blank and relatives
const j3_autocomplete__url = (dropdown) => {
  if (!dropdown.data('url')) throw new Error('Required data-url in .dropdown element')
  let url = dropdown.data('url')

  // Check searchQuery
  let searchQuery = dropdown.find('.j3_autocomplete__search').val() || ''
  if (searchQuery.length > 0) url = `${url}${j3_autocomplete__urlSeparator(url)}keyword=${searchQuery}`

  // Check relatives
  if (dropdown.data('relative')) url = `${url}${j3_autocomplete__urlSeparator(url)}relative=${j3_autocomplete__getRelativeVal(dropdown)}`

  return url
}

// Check if ? exists in url and return ? ou & as params separator
const j3_autocomplete__urlSeparator = (url) => {
  return (url.includes('?')) ? '&' : '?'
}

// Call URL and fill autocompleteResults container
const j3_autocomplete__getResults = (autocompleteResults, dropdown) => {
  let url = j3_autocomplete__url(dropdown)
  $.get(url, (response) => {
    // unbind search to prevent double requests
    dropdown.find('.j3_autocomplete__search').off('keyup') 

    // render results
    autocompleteResults.html(response)

    // bind item click event
    autocompleteResults.find('.records .dropdown-item').off('click').on('click', (event) => {
      j3_autocomplete__bindDropDownItemEvent(event)
    })
    dropdown.find('.j3_autocomplete__search').on('keyup', (event) => {
      j3_autocomplete__bindSearchEvent(event, dropdown)
    })
  })
}

// Search control chars allowed to send search
const j3_autocomplete__ALLOWED_CONTROL_KEYS = ['Backspace', 'Delete']

// Timer object to clear timeout @see j3_autocomplete__bindSearchEvent
var j3_autocomplete__timer = null

// Timeout to wait for more chars (in ms)
const j3_autocomplete__TIMEOUT = 500

// Bind search query key up events
const j3_autocomplete__bindSearchEvent = (event, dropdown) => {
  let key = event.originalEvent.code
  // Check if char is allowed
  if (j3_autocomplete__ALLOWED_CONTROL_KEYS.includes(key) || key.startsWith('Key') || key.startsWith('Digit')) {
    // prevent sequential submits using j3_autocomplete__timer
    clearTimeout(j3_autocomplete__timer)

    // create timer 
    j3_autocomplete__timer = setTimeout(function() {
      // Reload items
      j3_autocomplete__init(dropdown)
    }, j3_autocomplete__TIMEOUT)
  }
}

// Bind click event for dropdown items
const j3_autocomplete__bindDropDownItemEvent = (event) => {
  let target = $(event.currentTarget)
  let dropdown = target.parents('.dropdown.j3_autocomplete')

  // add selected class to dropdown to extend css capabilities
  dropdown.addClass('selected')

  // float mdc label
  dropdown.find('.mdc-floating-label').addClass('mdc-floating-label--float-above')

  // set id to hidden
  if (!target.data('id')) throw new Error('Required data-id attribute in .dropdown-item')
  dropdown.find('.mdc-text-field__input').html(target.html())
  dropdown.find('input[type="hidden"]').val(target.data('id'))

  // check relatives
  j3_autocomplete__checkRelatives(dropdown)

  // trigger change event
  dropdown.trigger('j3_autocomplete:change', [dropdown])
}

// Show all relatives autocompletes
const j3_autocomplete__checkRelatives = (dropdown) => {
  let inputId = dropdown.find('.j3_autocomplete__input').prop('id')
  // show all j3_autocomplete with this as relative
  $(`.j3_autocomplete[data-relative="#${inputId}"]`).j3_autocomplete()
}

const j3_autocomplete__clear = (dropdown) => {
  dropdown.removeClass('selected')
  dropdown.find('.j3_autocomplete__input').val('')
  dropdown.find('.mdc-text-field__input').html('')
  dropdown.find('.mdc-floating-label').removeClass('mdc-floating-label--float-above')
}

// Checks chained relative to disable component
const j3_autocomplete__isEnabled = (dropdown) => {
  if (dropdown.data('chained-relative')) {
    if (!dropdown.data('relative')) throw new Error('Required data-relative attribute in .j3_autocomplete')
    // if relative has value this component is enabled
    return j3_autocomplete__getRelativeVal(dropdown) != ''
  }
  return true
}

// Check if exists and get val of relative element 
const j3_autocomplete__getRelativeVal = (dropdown) => {
  let selector = dropdown.data('relative')
  let element = $(selector)
  if (element.length == 0) throw new Error(`Relative element not found: ${dropdown.data('relative')}`)
  return element.val()
};
