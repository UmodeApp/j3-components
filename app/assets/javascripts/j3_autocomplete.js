const j3_autocomplete_autoInit = () => {
  // Auto init j3_autocomplete component
  $('.j3_autocomplete').each((_index, object) => {
    $(object).j3_autocomplete()
  })
}
$(document).ready(j3_autocomplete_autoInit)

// JQuery plugin for j3_autocomplete component
$.fn.j3_autocomplete = function(forceClear = false) {
  dropdown = $(this)
  if (dropdown.length > 0) {
    // Prevents double initialization
    // if (dropdown[0].foundation) return dropdown
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
      console.log(`[j3_autocomplete] getResults for ${dropdown.find('.j3_autocomplete__input').prop('id')}`, forceClear)
      // Clear
      if (forceClear) dropdown.foundation.clear(dropdown)
      // Get results container
      let autocompleteResults = dropdown.find('.dropdown-menu .autocomplete-results')

      // Load from url
      if (dropdown.data('url')) {
        // Puts progress
        autocompleteResults.j3_progress()
        // Get URL
        let url = dropdown.foundation.url(dropdown)
        // Call URL
        $.get(url, (response) => {
          // unbind search to prevent double requests
          dropdown.find('.j3_autocomplete__search').off('keyup') 

          // render results
          autocompleteResults.html(response)
          // value
          let value = dropdown.foundation.val()
          // render selected
          if (value != '') {
            autocompleteResults.find('.dropdown-item').each((index, itemEl) => {
              let item = $(itemEl)
              if (item.data('id') == value)
                dropdown.foundation.selected(dropdown, item, forceClear)
            })
          }
          // bind events
          this.bindDropdownMenuEvents(dropdown, autocompleteResults)
        })
      }

      // Load from datalist
      else if (dropdown.data('list')) {
        let recordsDiv = $('<div class="records"></div>')
        autocompleteResults.append(recordsDiv)
        
        dropdown.data('list').forEach((record) => {
          // create dropdown-item
          let item = `<div class="dropdown-item" data-id="${record.id}">${record.name}</div>`
          // set value
          let selected = false
          if (dropdown.foundation.isMultiple())
            if (dropdown.find(`.j3_autocomplete__input[value=${record.id}]`).length > 0) selected = true
          else
            selected = (dropdown.foundation.val() == record.id) 
          if (selected) dropdown.foundation.selected(dropdown, $(item), forceClear)
          // append to records
          recordsDiv.append(item)
          // bind events
          this.bindDropdownMenuEvents(dropdown, autocompleteResults)
        })
      }
      return true
    }

    this.bindDropdownMenuEvents = (dropdown, autocompleteResults) => {
      // bind item click event
      autocompleteResults.find('.records .dropdown-item').off('click').on('click', (event) => {
        dropdown.foundation.bindDropDownItemEvent(dropdown, event)
      })
      // bind search event
      dropdown.find('.j3_autocomplete__search').on('keyup', (event) => {
        dropdown.foundation.bindSearchEvent(dropdown, event)
      })
      // bind save and redirect events
      dropdown.foundation.bindSaveAndRedirectEvents(dropdown)
      // Prevents show to load again
      dropdown.off('show.bs.dropdown')
      // trigger event
      dropdown.find('.j3_autocomplete__input').trigger('j3_autocomplete:getResults', [dropdown])
    }

    // Submit form when dropdown menu has a button and set j3_autocomplete__redirect hidden input
    this.bindSaveAndRedirectEvents = (dropdown) => {
      dropdown.find('.dropdown-menu .dropdown-item[data-save-session]').on('click', (e) => {
        $(dropdown.find('input')[0].form).append(`<input type="hidden" name="j3_autocomplete__redirect" value="${$(e.currentTarget).prop('href')}" />`).submit()
        return false
      })
    }

    // Value of autocomplete component
    this.val = () => dropdown.find('.j3_autocomplete__input').val()

    // Return true if has attribute multiple in dropdown
    this.isMultiple = () => dropdown.attr('multiple')

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
          console.log(`[j3_autocomplete] search for ${dropdown.find('.j3_autocomplete__search').val()}`)
          dropdown.foundation.bindShowEvent(dropdown)
        }, dropdown.foundation.TIMEOUT)
      }
    }

    // Bind event to remove item from multiple select
    this.bindMultipleSelectedItemEvent = (dropdown, selectedTag) => {
      selectedTag.on('click', (event) => {
        let recordId = $(event.currentTarget).data('id')
        dropdown.find(`.j3_autocomplete__input[value=${recordId}]`).remove()
        selectedTag.remove()
      })
    }

    // Mark item as selected
    this.selected = (dropdown, item, forceClear = true) => {
      // float mdc label
      dropdown.find('label').addClass('mdc-floating-label--float-above').addClass('active')
      // add selected class to dropdown to extend css capabilities
      dropdown.addClass('selected')
      let selectedTag
      if (dropdown.foundation.isMultiple()) {
        selectedTag = $(`<div class="badge" data-id="${item.data('id')}"><span class="item">${item.html()}</span> <span class="close">x</span></div>`)
        dropdown.foundation.bindMultipleSelectedItemEvent(dropdown, selectedTag)
        dropdown.find('.j3_autocomplete__label').append(selectedTag)
      } else {
        // set html to input
        selectedTag = dropdown.find('.j3_autocomplete__label').html(item.html())
      }
      // check relatives
      dropdown.foundation.checkRelatives(dropdown, forceClear)
      // trigger change event
      dropdown.find('.j3_autocomplete__input').trigger('j3_autocomplete:change', [dropdown, item, selectedTag])
    }

    // Bind click event for dropdown items
    this.bindDropDownItemEvent = (dropdown, event) => {
      let target = $(event.currentTarget)

      // set id to hidden
      if (!target.data('id')) throw new Error('Required data-id attribute in .dropdown-item')
      let input = dropdown.find('input[type="hidden"]')
      if ($(input).val()) {
        input = $(input).clone().insertAfter($(input))
        input.attr('name', `${input.attr('name')}[]`)
      } 
      input.val(target.data('id'))

      // set html to input
      dropdown.foundation.selected(dropdown, target, true)
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