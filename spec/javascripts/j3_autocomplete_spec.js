var autocompleteField

describe("j3_autocomplete", () => {
  beforeEach(() => {
    autocompleteField = $('<div class="dropdown j3_autocomplete" multiple="multiple" data-url="/components/episodes?parent_controller_action=multiple"><a href="#" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" class=" mdc-text-field w-100"><input class="j3_autocomplete__input" type="hidden" name="episode_multiple" id="episode_multiple"><label class="mdc-floating-label" for="episode_multiple">Episode multiple</label><div class="j3_autocomplete__label mdc-text-field__input w-100"></div></a><div class="dropdown-menu w-100"><input type="text" class="j3_autocomplete__search w-100" placeholder="Search"><div class="dropdown-divider"></div><div class="autocomplete-results"></div></div></div>')
    var div = $('<div style="display:none"></div>').appendTo($('body'))
    autocompleteField.appendTo(div)
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

  it('should select element on click', () => {
    focusDropdown()
    dropdownItems().first().trigger('click')
    expect(autocompleteField).toHaveClass('selected')
    expect(autocompleteField[0].foundation.val()).toBe("4")
    expect(autocompleteField.find('.j3_autocomplete__label').html()).toBe(dropdownItems().first().html())
  })
})

const focusDropdown = () => {
  // stub jquery get call
  spyOn($, 'get').and.callFake(episodesGet)
  this.autocompleteField.find('[data-toggle="dropdown"]').trigger('click')
}

const dropdownItems = __ => autocompleteField.find('.autocomplete-results .dropdown-item')

const episodesGet = (url, responseCallBack) => responseCallBack(episodesResponse)

const episodesResponse = '<div class="records"><div class="dropdown-item" data-id="4">Episódio IV – Uma Nova Esperança</div><div class="dropdown-item" data-id="5">Episódio V - O Império Contra-ataca</div><div class="dropdown-item" data-id="6">Episódio VI – O Retorno de Jedi</div><div class="dropdown-item" data-id="1">Episódio I – A Ameaça Fantasma</div><div class="dropdown-item" data-id="2">Episódio II – Ataque dos Clones</div><div class="dropdown-item" data-id="3">Episódio III – A Vingança dos Sith</div><div class="dropdown-item" data-id="7">Episódio VII – O Despertar da Força</div><div class="dropdown-item" data-id="8">Episódio VIII - Os Últimos Jedi</div><div class="dropdown-item" data-id="9">Episódio IX - A Ascensão Skywalker</div></div>'