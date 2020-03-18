$(() => {
  // Auto init j3_autocomplete component
  $('.j3_autocomplete').each((_index, object) => {
    $(object).j3_autocomplete()
  })
})

// JQuery plugin for j3_autocomplete component
$.fn.j3_autocomplete = function() {
  dropdown = $(this)
  if (dropdown.length > 0) {
    dropdown.j3_autocomplete_dropdown = new J3AutocompleteDropdown(dropdown)
    dropdown.j3_autocomplete_dropdown.init(dropdown)
  }
  return dropdown
}

/**
 * Class for autocomplete functions
 */
class J3AutocompleteDropdown {
  constructor(dropdown) {
    this.dropdown = dropdown

    // Init dropdown component
    this.init = (dropdown) => {
      if (dropdown.j3_autocomplete_dropdown.isEnabled(dropdown)) {
        dropdown.removeClass('d-none')
        if (dropdown.j3_autocomplete_dropdown.val() != '') {
          // if has value, load data and set value
          dropdown.j3_autocomplete_dropdown.bindShowEvent(dropdown, false)
        } else {
          // bind event on dropdown show
          dropdown.off('show.bs.dropdown').on('show.bs.dropdown', () => dropdown.j3_autocomplete_dropdown.bindShowEvent(dropdown))
        }
      } else {
        // add disabled class
        dropdown.addClass('d-none')
      }
    }

    // Init dropdown events and load results
    this.bindShowEvent = (dropdown, clear = true) => {
      // Puts progress
      let autocompleteResults = dropdown.find('.dropdown-menu .autocomplete-results')
      autocompleteResults.j3_progress()

      // Call URL
      dropdown.j3_autocomplete_dropdown.getResults(autocompleteResults, dropdown, clear)
      dropdown.off('show.bs.dropdown')
    }

    // Check URL param exists, add search query if not blank and relatives
    this.url = (dropdown) => {
      // if (!dropdown.data('url') && !dropdown.data('datalist')) throw new Error('Required data-url or data-datalist in .dropdown element')
      let url = dropdown.data('url')

      // Check searchQuery
      let searchQuery = dropdown.find('.j3_autocomplete__search').val() || ''
      if (searchQuery.length > 0) url = `${url}${dropdown.j3_autocomplete_dropdown.urlSeparator(url)}keyword=${searchQuery}`

      // Check value
      if (dropdown.j3_autocomplete_dropdown.val() !== undefined && dropdown.j3_autocomplete_dropdown.val() != '')
        url = `${url}${dropdown.j3_autocomplete_dropdown.urlSeparator(url)}value=${dropdown.j3_autocomplete_dropdown.val()}`

      // Check relatives
      if (dropdown.data('relative')) url = `${url}${dropdown.j3_autocomplete_dropdown.urlSeparator(url)}relative=${dropdown.j3_autocomplete_dropdown.getRelativeVal(dropdown)}`

      return url
    }

    // Check if ? exists in url and return ? ou & as params separator
    this.urlSeparator = (url) => {
      return (url.includes('?')) ? '&' : '?'
    }

    // Call URL and fill autocompleteResults container
    this.getResults = (autocompleteResults, dropdown, clear = true) => {
      if (dropdown.data('url')) {
        if (clear) dropdown.j3_autocomplete_dropdown.clear(dropdown)
        let url = dropdown.j3_autocomplete_dropdown.url(dropdown)
        let value = dropdown.j3_autocomplete_dropdown.val()
        $.get(url, (response) => {
          // unbind search to prevent double requests
          dropdown.find('.j3_autocomplete__search').off('keyup') 

          // render results
          autocompleteResults.html(response)

          // bind item click event
          autocompleteResults.find('.records .dropdown-item').off('click').on('click', (event) => {
            dropdown.j3_autocomplete_dropdown.bindDropDownItemEvent(dropdown, event)
          })
          dropdown.find('.j3_autocomplete__search').on('keyup', (event) => {
            dropdown.j3_autocomplete_dropdown.bindSearchEvent(dropdown, event)
          })

          // render selected
          if (value != '') {
            autocompleteResults.find('.dropdown-item').each((index, itemEl) => {
              let item = $(itemEl)
              if (item.data('id') == value)
                dropdown.j3_autocomplete_dropdown.selected(dropdown, item.html())
            })
          }

        })
      }
    }

    // Value of autocomplete component
    this.val = () => {
      return dropdown.find('.j3_autocomplete__input').val()
    }

    // Search control chars allowed to send search
    this.ALLOWED_CONTROL_KEYS = ['Backspace', 'Delete']

    // Timer object to clear timeout @see bindSearchEvent
    this.timer = null

    // Timeout to wait for more chars (in ms)
    this.TIMEOUT = 500

    // Bind search query key up events
    this.bindSearchEvent = (dropdown, event) => {
      let key = event.originalEvent.code
      // Check if char is allowed
      if (dropdown.j3_autocomplete_dropdown.ALLOWED_CONTROL_KEYS.includes(key) || key.startsWith('Key') || key.startsWith('Digit')) {
        // prevent sequential submits using timer
        clearTimeout(dropdown.j3_autocomplete_dropdown.timer)

        // create timer 
        dropdown.j3_autocomplete_dropdown.timer = setTimeout(function() {
          // Reload items
          dropdown.j3_autocomplete_dropdown.bindShowEvent(dropdown)
        }, dropdown.j3_autocomplete_dropdown.TIMEOUT)
      }
    }

    this.selected = (dropdown, html) => {
      // set html to input
      dropdown.find('.j3_autocomplete__label').html(html)
      // float mdc label
      dropdown.find('.mdc-floating-label').addClass('mdc-floating-label--float-above')
      // add selected class to dropdown to extend css capabilities
      dropdown.addClass('selected')
      // check relatives
      dropdown.j3_autocomplete_dropdown.checkRelatives(dropdown)
    }

    // Bind click event for dropdown items
    this.bindDropDownItemEvent = (dropdown, event) => {
      let target = $(event.currentTarget)

      // set id to hidden
      if (!target.data('id')) throw new Error('Required data-id attribute in .dropdown-item')
      dropdown.find('input[type="hidden"]').val(target.data('id'))

      // set html to input
      dropdown.j3_autocomplete_dropdown.selected(dropdown, target.html())

      // trigger change event
      dropdown.find('.j3_autocomplete__input').trigger('j3_autocomplete:change', [dropdown])
    }

    // Show all relatives autocompletes
    this.checkRelatives = (dropdown) => {
      let inputId = dropdown.find('.j3_autocomplete__input').prop('id')
      // show all j3_autocomplete with this as relative
      let relative = $(`.j3_autocomplete[data-relative="#${inputId}"]`)
      if (relative.length > 0) {
        relative = relative.j3_autocomplete()
        relative.j3_autocomplete_dropdown.clear(relative)
      }
    }

    this.clear = (dropdown) => {
      dropdown.removeClass('selected')
      dropdown.find('.j3_autocomplete__input').val('')
      dropdown.find('.j3_autocomplete__label').html('')
      dropdown.find('.mdc-floating-label').removeClass('mdc-floating-label--float-above')
    }

    // Checks chained relative to disable component
    this.isEnabled = (dropdown) => {
      if (dropdown.data('chained-relative')) {
        if (!dropdown.data('relative')) throw new Error('Required data-relative attribute in .j3_autocomplete')
        // if relative has value this component is enabled
        return dropdown.j3_autocomplete_dropdown.getRelativeVal(dropdown) != ''
      }
      return true
    }

    // Check if exists and get val of relative element 
    this.getRelativeVal = (dropdown) => {
      let selector = dropdown.data('relative')
      let element = $(selector)
      if (element.length == 0) throw new Error(`Relative element not found: ${dropdown.data('relative')}`)
      return element.val()
    }
  }
}