var autocompleteField

describe("j3_autocomplete clean", () => {
  beforeEach(() => {
    autocompleteField = createAutocompleteField()
    // Initialize j3_autocomplete
    $(autocompleteField).j3_autocomplete()
  })

  it('should init create foundation object', () => {
    expect(autocompleteField[0].foundation).not.toBe(null)
  })

  it('should load dropdown results when focus on field', () => {
    focusDropdown()
    expect(autocompleteField).toHaveClass('show')
    expect(dropdownItems().length).toBe(9)
    expect(dropdownItems()).toHandle('click')
  })

  it('should search', () => {
    focusDropdown()
    jasmine.clock().install()
    keyupEvent = $.Event('keyup')
    keyupEvent.originalEvent = { code: 'Keyj' }
    autocompleteField.find('.j3_autocomplete__search').val('j').trigger(keyupEvent)
    jasmine.clock().tick(500)
    expect(dropdownItems().length).toBe(2)
  })

  it('should select element on click', () => {
    focusDropdown()
    dropdownItems().first().trigger('click')
    expect(autocompleteField).toHaveClass('selected')
    expect(autocompleteField[0].foundation.val()).toBe("4")
    expect(autocompleteField.find('.j3_autocomplete__label').html()).toBe(dropdownItems().first().html())
  })

  it('should raise if there is not data-id in autocomplete results', () => {
    autocompleteField.attr('data-url', '/without-id')
    focusDropdown()
    expect(() => dropdownItems().first().trigger('click')).toThrowError(Error)
  })
})

describe('j3_autocomplete filled', () => {
  it('should load autocomplete when value if filled', () => {
    autocompleteField = createAutocompleteField({ value: '5' })
    autocompleteField.j3_autocomplete()
    expect(autocompleteField).not.toHaveClass('show')
    expect(dropdownItems().length).toBe(9)
    expect(autocompleteField).toHaveClass('selected')
    expect(autocompleteField[0].foundation.val()).toBe('5')
  })

})

describe('j3_autocomplete relative', () => {
  afterEach(() => {
    $('.j3_autocomplete').remove()
  })

  it('should hide when has chained relative without value', () => {
    relativeField = createAutocompleteField({ name: 'episode', url: '/episodes' })
    autocompleteField = createAutocompleteField({ name: 'hero', url: '/heroes', relative: '#episode', chainedRelative: true })
    j3_autocomplete_autoInit()
    expect(autocompleteField).toHaveClass('d-none')
  })

  it('should not hide when has chained relative without value', () => {
    relativeField = createAutocompleteField({ name: 'episode', url: '/episodes' })
    autocompleteField = createAutocompleteField({ name: 'hero', url: '/heroes', relative: '#episode' })
    j3_autocomplete_autoInit()
    expect(autocompleteField).not.toHaveClass('d-none')
  })

  it('should show child when relative value selected', () => {
    relativeField = createAutocompleteField({ name: 'episode', url: '/episodes' })
    autocompleteField = createAutocompleteField({ name: 'hero', url: '/heroes', relative: '#episode', chainedRelative: true })
    j3_autocomplete_autoInit()
    expect(autocompleteField).toHaveClass('d-none')
    focusDropdown(relativeField)
    dropdownItems(relativeField).first().trigger('click')
    expect(autocompleteField).not.toHaveClass('d-none')
  })

  it('should use relative value to load child', () => {
    relativeField = createAutocompleteField({ name: 'episode', url: '/episodes?force=true', value: '4' })
    autocompleteField = createAutocompleteField({ name: 'hero', url: '/heroes', relative: '#episode' })
    j3_autocomplete_autoInit()
    focusDropdown()
    expect(dropdownItems().length).toBe(2)
  })

  it('should clear when relative changes', () => {
    relativeField = createAutocompleteField({ name: 'episode', url: '/episodes?force=true', value: '4' })
    autocompleteField = createAutocompleteField({ name: 'hero', url: '/heroes', relative: '#episode', value: '1' })
    j3_autocomplete_autoInit()
    // load child
    focusDropdown()
    expect(dropdownItems().length).toBe(2)
    // change relative value
    focusDropdown(relativeField)
    dropdownItems(relativeField).last().trigger('click')
    // assert child is empty
    expect(dropdownItems().length).toBe(0)
  })

  it('should throw Error if has chained-relative without relative attribute', () => {
    autocompleteField = createAutocompleteField({ name: 'hero', url: '/heroes', chainedRelative: true })
    expect(__ => autocompleteField.j3_autocomplete()).toThrowError(Error)
  })

  it('should throw Error if relative doesnt exist', () => {
    autocompleteField = createAutocompleteField({ name: 'hero', url: '/heroes', relative: '#notFound' })
    autocompleteField.j3_autocomplete()
    expect(__ => focusDropdown()).toThrowError(Error)
  })
})

describe('j3_autocomplete save session', () => {
  it('should create redirect hidden and sumit form when click in [data-save-session=true]', () =>{
    autocompleteField = createAutocompleteField()
    autocompleteField.j3_autocomplete()
    focusDropdown()
    form = $('form')
    formSpy = spyOnEvent(form, 'submit')
    autocompleteField.find('[data-save-session=true]').trigger('click')
    expect($(form).find('input[name=j3_autocomplete__redirect]').length).toBe(1)
    expect(formSpy.calls.count()).toBe(1)
  })
})

const focusDropdown = (field = autocompleteField) => {
  // stub jquery get call
  field.find('[data-toggle="dropdown"]').trigger('click')
}

const dropdownItems = (field = autocompleteField) => field.find('.autocomplete-results .records .dropdown-item')

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

const episode6 = '<div class="dropdown-item" data-id="6">Episódio VI – O Retorno de Jedi</div>'
const episode8 = '<div class="dropdown-item" data-id="8">Episódio VIII - Os Últimos Jedi</div>'
const episodesResponse = `<div class="records"><div class="dropdown-item" data-id="4">Episódio IV – Uma Nova Esperança</div><div class="dropdown-item" data-id="5">Episódio V - O Império Contra-ataca</div>${episode6}<div class="dropdown-item" data-id="1">Episódio I – A Ameaça Fantasma</div><div class="dropdown-item" data-id="2">Episódio II – Ataque dos Clones</div><div class="dropdown-item" data-id="3">Episódio III – A Vingança dos Sith</div><div class="dropdown-item" data-id="7">Episódio VII – O Despertar da Força</div>${episode8}<div class="dropdown-item" data-id="9">Episódio IX - A Ascensão Skywalker</div></div><a class="dropdown-item" href="/episodes/new" data-save-session="true">Novo Episódio</a>`

const createAutocompleteField = (options = { name: 'eposide', url: '/episodes' }) => {
  field = $(`<div class="dropdown j3_autocomplete" data-url="${options.url}"${(options.relative) ? ` data-relative="${options.relative}"` : ''}${(options.chainedRelative==true) ? ' data-chained-relative="true"' : ''}><a href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class=" mdc-text-field w-100"><input class="j3_autocomplete__input" type="hidden" name="${options.name}" id="${options.name}"${(options.value) ? ` value="${options.value}"` : ''}><label class="mdc-floating-label" for="${options.name}">${options.name}</label><div class="j3_autocomplete__label mdc-text-field__input w-100"></div></a><div class="dropdown-menu w-100"><input type="text" class="j3_autocomplete__search w-100" placeholder="Search"><div class="dropdown-divider"></div><div class="autocomplete-results"></div></div></div>`)
  try { spyOn($, 'ajax').and.callFake(ajaxMock) } catch (e) {}
  var div = $('<div style="display:none"></div>').appendTo($('form'))
  field.appendTo(div)
  return field
}

$(() => {
  $('<form onsubmit="return false"></form>').appendTo($('body'))
})