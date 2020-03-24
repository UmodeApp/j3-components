$(() => {
  // Auto init j3_autocomplete component
  $('.j3_autocomplete').each((_index, object) => {
    $(object).j3_autocomplete()
  })
})

// JQuery plugin for j3_autocomplete component
$.fn.j3_autocomplete = function(forceClear = false) {
  dropdown = $(this)
  if (dropdown.length > 0) {
    // Create foundation in jquery object
    dropdown.foundation = new J3AutocompleteDropdown(dropdown)
    // Associate to html element too
    dropdown[0].foundation = dropdown.foundation
    // Init foundation
    dropdown.foundation.init(dropdown, forceClear)
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
    this.init = (dropdown, forceClear) => {
      if (dropdown.foundation.isEnabled(dropdown)) {
        dropdown.removeClass('d-none')
        if (dropdown.foundation.val() != '') {
          // if has value, load data and set value
          dropdown.foundation.bindShowEvent(dropdown, forceClear)
        } else {
          // bind event on dropdown show
          dropdown.off('show.bs.dropdown').on('show.bs.dropdown', () => dropdown.foundation.bindShowEvent(dropdown))
        }
      } else {
        // add disabled class
        dropdown.addClass('d-none')
      }
    }

    // Init dropdown events and load results
    this.bindShowEvent = (dropdown, clear = true) => {
      // Call URL
      dropdown.foundation.getResults(dropdown, clear)
    }

    // Check URL param exists, add search query if not blank and relatives
    this.url = (dropdown) => {
      // if (!dropdown.data('url') && !dropdown.data('datalist')) throw new Error('Required data-url or data-datalist in .dropdown element')
      let url = dropdown.data('url')

      // Check searchQuery
      let searchQuery = dropdown.find('.j3_autocomplete__search').val() || ''
      if (searchQuery.length > 0) url = `${url}${dropdown.foundation.urlSeparator(url)}keyword=${searchQuery}`

      // Check value
      if (dropdown.foundation.val() !== undefined && dropdown.foundation.val() != '')
        url = `${url}${dropdown.foundation.urlSeparator(url)}value=${dropdown.foundation.val()}`

      // Check relatives
      if (dropdown.data('relative')) url = `${url}${dropdown.foundation.urlSeparator(url)}relative=${dropdown.foundation.getRelativeVal(dropdown)}`

      return url
    }

    // Check if ? exists in url and return ? ou & as params separator
    this.urlSeparator = (url) => {
      return (url.includes('?')) ? '&' : '?'
    }

    // Call URL and fill autocompleteResults container
    this.getResults = (dropdown, forceClear = true) => {
      if (dropdown.data('url')) {
        console.log(`[j3_autocomplete] getResults for ${dropdown.find('.j3_autocomplete__input').prop('id')}`, forceClear)
    
        // Puts progress
        let autocompleteResults = dropdown.find('.dropdown-menu .autocomplete-results')
        autocompleteResults.j3_progress()

        // Clear
        if (forceClear) dropdown.foundation.clear(dropdown)

        // Get URL and value
        let url = dropdown.foundation.url(dropdown)
        let value = dropdown.foundation.val()

        // Call URL
        $.get(url, (response) => {
          // unbind search to prevent double requests
          dropdown.find('.j3_autocomplete__search').off('keyup') 

          // render results
          autocompleteResults.html(response)

          // bind item click event
          autocompleteResults.find('.records .dropdown-item').off('click').on('click', (event) => {
            dropdown.foundation.bindDropDownItemEvent(dropdown, event)
          })
          dropdown.find('.j3_autocomplete__search').on('keyup', (event) => {
            dropdown.foundation.bindSearchEvent(dropdown, event)
          })

          // render selected
          if (value != '') {
            autocompleteResults.find('.dropdown-item').each((index, itemEl) => {
              let item = $(itemEl)
              if (item.data('id') == value)
                dropdown.foundation.selected(dropdown, item.html(), forceClear)
            })
          }
          // bind save and redirect events
          dropdown.foundation.bindSaveAndRedirectEvents(dropdown)
          // Prevents show to load again
          dropdown.off('show.bs.dropdown')
          // trigger event
          dropdown.find('.j3_autocomplete__input').trigger('j3_autocomplete:getResults', [dropdown])
        })
      }
    }

    // Submit form when dropdown menu has a button and set j3_autocomplete__redirect hidden input
    this.bindSaveAndRedirectEvents = (dropdown) => {
      dropdown.find('.dropdown-menu .mdc-button').on('click', (e) => {
        $(dropdown.find('input')[0].form).append(`<input type="hidden" name="j3_autocomplete__redirect" value="${$(e.currentTarget).prop('href')}" />`).submit()
        return false
      })
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
      if (dropdown.foundation.ALLOWED_CONTROL_KEYS.includes(key) || key.startsWith('Key') || key.startsWith('Digit')) {
        // prevent sequential submits using timer
        clearTimeout(dropdown.foundation.timer)

        // create timer 
        dropdown.foundation.timer = setTimeout(function() {
          // Reload items
          dropdown.foundation.bindShowEvent(dropdown)
        }, dropdown.foundation.TIMEOUT)
      }
    }

    this.selected = (dropdown, html, forceClear = true) => {
      // set html to input
      dropdown.find('.j3_autocomplete__label').html(html)
      // float mdc label
      dropdown.find('.mdc-floating-label').addClass('mdc-floating-label--float-above')
      // add selected class to dropdown to extend css capabilities
      dropdown.addClass('selected')
      // check relatives
      dropdown.foundation.checkRelatives(dropdown, forceClear)
      // trigger change event
      dropdown.find('.j3_autocomplete__input').trigger('j3_autocomplete:change', [dropdown])
    }

    // Bind click event for dropdown items
    this.bindDropDownItemEvent = (dropdown, event) => {
      let target = $(event.currentTarget)

      // set id to hidden
      if (!target.data('id')) throw new Error('Required data-id attribute in .dropdown-item')
      dropdown.find('input[type="hidden"]').val(target.data('id'))

      // set html to input
      dropdown.foundation.selected(dropdown, target.html(), true)
    }

    // Show all relatives autocompletes
    this.checkRelatives = (dropdown, forceClear = true) => {
      // show all j3_autocomplete with this as relative
      let relative = dropdown.foundation.findRelatives(dropdown)
      if (relative.length > 0) {
        relative = relative.j3_autocomplete(forceClear)
      }
    }

    this.findRelatives = (dropdown) => $(`.j3_autocomplete[data-relative="#${dropdown.find('.j3_autocomplete__input').prop('id')}"]`)

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
        return dropdown.foundation.getRelativeVal(dropdown) != ''
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