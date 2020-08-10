
describe('j3_autocomplete', () => {
  describe("j3_autocomplete clean", () => {  
    it('should init create foundation object', () => {
      let autocompleteField = createAutocompleteField()
      $(autocompleteField).j3_autocomplete()
      expect(autocompleteField[0].foundation).not.toBe(null)
    })
  
    it('should load dropdown results when focus on field', () => {
      let autocompleteField = createAutocompleteField()
      autocompleteField.j3_autocomplete()
      focusDropdown(autocompleteField)
      expect(dropdownItems(autocompleteField).length).toBe(9)
      expect(dropdownItems(autocompleteField)).toHandle('click')
    })
  
    it('should search', () => {
      let autocompleteField = createAutocompleteField()
      autocompleteField.j3_autocomplete()
      focusDropdown(autocompleteField)
      jasmine.clock().install()
      keyupEvent = $.Event('keyup')
      keyupEvent.originalEvent = { code: 'Keyj' }
      autocompleteField.find('.j3_autocomplete__search').val('j').trigger(keyupEvent)
      jasmine.clock().tick(500)
      expect(dropdownItems(autocompleteField).length).toBe(2)
    })
  
    it('should select element on click', () => {
      let autocompleteField = createAutocompleteField()
      autocompleteField.j3_autocomplete()
      focusDropdown(autocompleteField)
      dropdownItems(autocompleteField).first().trigger('click')
      expect(autocompleteField).toHaveClass('selected')
      expect(autocompleteField[0].foundation.val()).toBe("4")
      expect(autocompleteField.find('.j3_autocomplete__label').html()).toBe(dropdownItems(autocompleteField).first().html())
    })
  
    it('should raise if there is not data-id in autocomplete results', () => {
      let autocompleteField = createAutocompleteField()
      autocompleteField.attr('data-url', '/without-id')
      focusDropdown(autocompleteField)
      expect(() => dropdownItems().first().trigger('click')).toThrowError(Error)
    })
  })
  
  describe('j3_autocomplete filled', () => {
    it('should load autocomplete when value if filled', () => {
      var autocompleteField = createAutocompleteField({ value: '5' })
      autocompleteField.j3_autocomplete()
      expect(autocompleteField).not.toHaveClass('show')
      expect(dropdownItems(autocompleteField).length).toBe(9)
      expect(autocompleteField).toHaveClass('selected')
      expect(autocompleteField[0].foundation.val()).toBe('5')
    })
  
  })
  
  describe('j3_autocomplete relative', () => {
    var autocompleteField, relativeField
    afterEach(() => {
      autocompleteField.remove()
      if (relativeField) relativeField.remove()
    })
  
    it('should hide when has chained relative without value', () => {
      relativeField = createAutocompleteField({ name: 'episode', url: '/episodes' })
      autocompleteField = createAutocompleteField({ name: 'hero', url: '/heroes', relative: `#${relativeField.find('input').prop('id')}`, chainedRelative: true })
      j3_autocomplete_autoInit()
      expect(autocompleteField).toHaveClass('d-none')
    })
  
    it('should not hide when has chained relative without value', () => {
      relativeField = createAutocompleteField({ name: 'episode', url: '/episodes' })
      autocompleteField = createAutocompleteField({ name: 'hero', url: '/heroes', relative: `#${relativeField.find('input').prop('id')}` })
      j3_autocomplete_autoInit()
      expect(autocompleteField).not.toHaveClass('d-none')
    })
  
    it('should show child when relative value selected', () => {
      relativeField = createAutocompleteField({ name: 'episode', url: '/episodes' })
      autocompleteField = createAutocompleteField({ name: 'hero', url: '/heroes', relative: `#${relativeField.find('input').prop('id')}`, chainedRelative: true })
      j3_autocomplete_autoInit()
      expect(autocompleteField).toHaveClass('d-none')
      focusDropdown(relativeField)
      dropdownItems(relativeField).first().trigger('click')
      expect(autocompleteField).not.toHaveClass('d-none')
    })
  
    it('should use relative value to load child', () => {
      relativeField = createAutocompleteField({ name: 'episode', url: '/episodes?force=true', value: '4' })
      autocompleteField = createAutocompleteField({ name: 'hero', url: '/heroes', relative: `#${relativeField.find('input').prop('id')}` })
      j3_autocomplete_autoInit()
      focusDropdown(autocompleteField)
      expect(dropdownItems(autocompleteField).length).toBe(2)
    })
  
    it('should clear when relative changes', () => {
      relativeField = createAutocompleteField({ name: 'episode', url: '/episodes?force=true', value: '4' })
      autocompleteField = createAutocompleteField({ name: 'hero', url: '/heroes', relative: `#${relativeField.find('input').prop('id')}`, value: '1' })
      j3_autocomplete_autoInit()
      // load child
      focusDropdown(autocompleteField)
      expect(dropdownItems(autocompleteField).length).toBe(2)
      // change relative value
      focusDropdown(relativeField)
      dropdownItems(relativeField).last().trigger('click')
      // assert child is empty
      expect(dropdownItems(autocompleteField).length).toBe(0)
    })
  
    it('should throw Error if has chained-relative without relative attribute', () => {
      autocompleteField = createAutocompleteField({ name: 'hero', url: '/heroes', chainedRelative: true })
      expect(__ => autocompleteField.j3_autocomplete()).toThrowError(Error)
    })
  
    it('should throw Error if relative doesnt exist', () => {
      autocompleteField = createAutocompleteField({ name: 'hero', url: '/heroes', relative: '#notFound' })
      autocompleteField.j3_autocomplete()
      expect(__ => focusDropdown(autocompleteField)).toThrowError(Error)
    })
  })
  
  describe('save session', () => {
    it('should create redirect hidden and sumit form when click in [data-save-session=true]', () => {
      let autocompleteField = createAutocompleteField()
      autocompleteField.j3_autocomplete()
      focusDropdown(autocompleteField)
      form = $('form')
      formSpy = spyOnEvent(form, 'submit')
      autocompleteField.find('[data-save-session=true]').trigger('click')
      expect($(form).find('input[name=j3_autocomplete__redirect]').length).toBe(1)
      expect(formSpy.calls.count()).toBe(1)
    })
  })
  
  describe('j3_autocomplete with datalist', () => {
    it('should show options from datalist and without url', () => {
      let autocompleteField = createAutocompleteField({ dataList: episodesJson, url: null })
      autocompleteField.j3_autocomplete()
      focusDropdown(autocompleteField)
      dropdownItems(autocompleteField).first().trigger('click')
      expect(autocompleteField).toHaveClass('selected')
      expect(autocompleteField[0].foundation.val()).toBe("1")
      expect(autocompleteField.find('.j3_autocomplete__label').html()).toBe(dropdownItems(autocompleteField).first().html())
    })
  })
  
  describe('j3_autocomplete multiple', () => {
    it('should render multiple component', () => {
      let autocompleteField = createAutocompleteField({ dataList: episodesJson, url: null, multiple: true })
    })
  })
  
})

const focusDropdown = (field) => {
  // stub jquery get call
  field.find('[data-toggle="dropdown"]').trigger('click')
  return field
}

const dropdownItems = (field) => field.find('.autocomplete-results .records .dropdown-item')

const ajaxMock = (options) => {
  if (options.url.includes('keyword')) {
    response = `<div class="records">${episode6}${episode8}</div>`
  } else if (options.url == '/without-id') {
    response = '<div class="records"><div class="dropdown-item">without id</div></div>'
  } else if (options.url.startsWith('/heroes')) {
    if (options.url.includes('relative=4'))
      response = '<div class="records"><div class="dropdown-item" data-id="1">Luke</div><div class="dropdown-item" data-id="2">Leia</div></div>'
    else
    response = '<div class="records"></div>'
  } else {
    response = episodesResponse
  }
  options.success(response)
}

episodesJson = [
  { id: 1, name: 'Episódio I – A Ameaça Fantasma' },
  { id: 2, name: 'Episódio II – Ataque dos Clones' },
  { id: 3, name: 'Episódio III – A Vingança dos Sith' },
  { id: 4, name: 'Episódio IV – Uma Nova Esperança' },
  { id: 5, name: 'Episódio V - O Império Contra-ataca' },
  { id: 6, name: 'Episódio VI – O Retorno de Jedi' },
  { id: 7, name: 'Episódio VII – O Despertar da Força' },
  { id: 8, name: 'Episódio VIII - Os Últimos Jedi' },
  { id: 9, name: 'Episódio IX - A Ascensão Skywalker' }
]
const episode6 = '<div class="dropdown-item" data-id="6">Episódio VI – O Retorno de Jedi</div>'
const episode8 = '<div class="dropdown-item" data-id="8">Episódio VIII - Os Últimos Jedi</div>'
const episodesResponse = `<div class="records"><div class="dropdown-item" data-id="4">Episódio IV – Uma Nova Esperança</div><div class="dropdown-item" data-id="5">Episódio V - O Império Contra-ataca</div>${episode6}<div class="dropdown-item" data-id="1">Episódio I – A Ameaça Fantasma</div><div class="dropdown-item" data-id="2">Episódio II – Ataque dos Clones</div><div class="dropdown-item" data-id="3">Episódio III – A Vingança dos Sith</div><div class="dropdown-item" data-id="7">Episódio VII – O Despertar da Força</div>${episode8}<div class="dropdown-item" data-id="9">Episódio IX - A Ascensão Skywalker</div></div><a class="dropdown-item" href="/episodes/new" data-save-session="true">Novo Episódio</a>`

var idCount = 0
const createAutocompleteField = (options = {}) => {
  options = { name: 'episode', url: '/episodes', ...options }
  options.id = `${options.name}-${++idCount}`
  field = $(`<div class="dropdown j3_autocomplete" data-url="${options.url}"${(options.relative) ? ` data-relative="${options.relative}"` : ''}${(options.chainedRelative==true) ? ' data-chained-relative="true"' : ''}${options.multiple ? ' data-multiple="true"' : ''}><a href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class=" mdc-text-field w-100"><input class="j3_autocomplete__input" type="hidden" name="${options.name}" id="${options.id}"${(options.value) ? ` value="${options.value}"` : ''}><label class="mdc-floating-label" for="${options.id}">${options.name}</label><div class="j3_autocomplete__label mdc-text-field__input w-100"></div></a><div class="dropdown-menu w-100"><input type="text" class="j3_autocomplete__search w-100" placeholder="Search"><div class="dropdown-divider"></div><div class="autocomplete-results"></div></div></div>`)
  if (options.dataList) field.attr('data-list', JSON.stringify(options.dataList))
  try { spyOn($, 'ajax').and.callFake(ajaxMock) } catch (e) {}
  var div = $('<div class="autocomplete-container" style="display:block"></div>').appendTo($('form'))
  field.appendTo(div)
  return field
}

$(() => {
  $('<form onsubmit="return false"></form><link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"><script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script><script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script><link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons"><link href="https://unpkg.com/material-components-web@v4.0.0/dist/material-components-web.min.css" rel="stylesheet"><script src="https://unpkg.com/material-components-web@v4.0.0/dist/material-components-web.min.js"></script>').appendTo($('#jasmine_content'))
})