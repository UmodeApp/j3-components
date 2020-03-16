$(() => {
  // Auto init j3_autocomplete component
  $('.j3_autocomplete').each((_index, object) => {
    $(object).j3_autocomplete()
  })
})

// JQuery plugin for j3_autocomplete component
$.fn.j3_autocomplete = function() {
  dropdown = $(this)
  dropdown.j3_autocomplete_dropdown = new J3AutocompleteDropdown(dropdown)
}

/**
 * Class for autocomplete functions
 */
class J3AutocompleteDropdown {
  constructor(dropdown) {
    this.dropdown = dropdown

    if (this.j3_autocomplete__isEnabled(dropdown)) {
      dropdown.removeClass('d-none')
      this.j3_autocomplete__clear(dropdown)
      dropdown.off('show.bs.dropdown').on('show.bs.dropdown', () => this.j3_autocomplete__init(dropdown))
    } else {
      // add disabled class
      dropdown.addClass('d-none')
    }
  }
}

// Init dropdown events and load results
J3AutocompleteDropdown.prototype.j3_autocomplete__init = (dropdown) => {
  // Puts progress
  let autocompleteResults = dropdown.find('.dropdown-menu .autocomplete-results')
  autocompleteResults.j3_progress()

  // Call URL
  dropdown.j3_autocomplete_dropdown.j3_autocomplete__getResults(autocompleteResults, dropdown)
}

// Check URL param exists, add search query if not blank and relatives
J3AutocompleteDropdown.prototype.j3_autocomplete__url = (dropdown) => {
  if (!dropdown.data('url')) throw new Error('Required data-url in .dropdown element')
  let url = dropdown.data('url')

  // Check searchQuery
  let searchQuery = dropdown.find('.j3_autocomplete__search').val() || ''
  if (searchQuery.length > 0) url = `${url}${this.j3_autocomplete__urlSeparator(url)}keyword=${searchQuery}`

  // Check relatives
  if (dropdown.data('relative')) url = `${url}${this.j3_autocomplete__urlSeparator(url)}relative=${this.j3_autocomplete__getRelativeVal(dropdown)}`

  return url
}

// Check if ? exists in url and return ? ou & as params separator
J3AutocompleteDropdown.prototype.j3_autocomplete__urlSeparator = (url) => {
  return (url.includes('?')) ? '&' : '?'
}

// Call URL and fill autocompleteResults container
J3AutocompleteDropdown.prototype.j3_autocomplete__getResults = (autocompleteResults, dropdown) => {
  let url = dropdown.j3_autocomplete_dropdown.j3_autocomplete__url(dropdown)
  $.get(url, (response) => {
    // unbind search to prevent double requests
    dropdown.find('.j3_autocomplete__search').off('keyup') 

    // render results
    autocompleteResults.html(response)

    // bind item click event
    autocompleteResults.find('.records .dropdown-item').off('click').on('click', (event) => {
      dropdown.j3_autocomplete_dropdown.j3_autocomplete__bindDropDownItemEvent(dropdown, event)
    })
    dropdown.find('.j3_autocomplete__search').on('keyup', (event) => {
      dropdown.j3_autocomplete_dropdown.j3_autocomplete__bindSearchEvent(event, dropdown)
    })
  })
}

// Search control chars allowed to send search
J3AutocompleteDropdown.prototype.j3_autocomplete__ALLOWED_CONTROL_KEYS = ['Backspace', 'Delete']

// Timer object to clear timeout @see j3_autocomplete__bindSearchEvent
J3AutocompleteDropdown.prototype.j3_autocomplete__timer = null

// Timeout to wait for more chars (in ms)
J3AutocompleteDropdown.prototype.j3_autocomplete__TIMEOUT = 500

// Bind search query key up events
J3AutocompleteDropdown.prototype.j3_autocomplete__bindSearchEvent = (event, dropdown) => {
  let key = event.originalEvent.code
  // Check if char is allowed
  if (this.j3_autocomplete__ALLOWED_CONTROL_KEYS.includes(key) || key.startsWith('Key') || key.startsWith('Digit')) {
    // prevent sequential submits using j3_autocomplete__timer
    clearTimeout(this.j3_autocomplete__timer)

    // create timer 
    this.j3_autocomplete__timer = setTimeout(function() {
      // Reload items
      this.j3_autocomplete__init(dropdown)
    }, this.j3_autocomplete__TIMEOUT)
  }
}

// Bind click event for dropdown items
J3AutocompleteDropdown.prototype.j3_autocomplete__bindDropDownItemEvent = (dropdown, event) => {
  let target = $(event.currentTarget)
  // let dropdown = target.parents('.dropdown.j3_autocomplete')

  // add selected class to dropdown to extend css capabilities
  dropdown.addClass('selected')

  // float mdc label
  dropdown.find('.mdc-floating-label').addClass('mdc-floating-label--float-above')

  // set id to hidden
  if (!target.data('id')) throw new Error('Required data-id attribute in .dropdown-item')
  dropdown.find('.j3_autocomplete__input').html(target.html())
  dropdown.find('input[type="hidden"]').val(target.data('id'))

  // check relatives
  dropdown.j3_autocomplete_dropdown.j3_autocomplete__checkRelatives(dropdown)

  // trigger change event
  dropdown.trigger('j3_autocomplete:change', [dropdown])
}

// Show all relatives autocompletes
J3AutocompleteDropdown.prototype.j3_autocomplete__checkRelatives = (dropdown) => {
  let inputId = dropdown.find('.j3_autocomplete__input').prop('id')
  // show all j3_autocomplete with this as relative
  $(`.j3_autocomplete[data-relative="#${inputId}"]`).j3_autocomplete()
}

J3AutocompleteDropdown.prototype.j3_autocomplete__clear = (dropdown) => {
  dropdown.removeClass('selected')
  dropdown.find('.j3_autocomplete__input').val('')
  dropdown.find('.j3_autocomplete__input').html('')
  dropdown.find('.mdc-floating-label').removeClass('mdc-floating-label--float-above')
}

// Checks chained relative to disable component
J3AutocompleteDropdown.prototype.j3_autocomplete__isEnabled = (dropdown) => {
  if (dropdown.data('chained-relative')) {
    if (!dropdown.data('relative')) throw new Error('Required data-relative attribute in .j3_autocomplete')
    // if relative has value this component is enabled
    return this.j3_autocomplete__getRelativeVal(dropdown) != ''
  }
  return true
}

// Check if exists and get val of relative element 
J3AutocompleteDropdown.prototype.j3_autocomplete__getRelativeVal = (dropdown) => {
  let selector = dropdown.data('relative')
  let element = $(selector)
  if (element.length == 0) throw new Error(`Relative element not found: ${dropdown.data('relative')}`)
  return element.val()
}