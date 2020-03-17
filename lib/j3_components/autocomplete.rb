# = Autocomplete Helpers
module J3Components::Autocomplete
  ##
  # Render j3 autocomplete component
  #
  # ==== Examples
  #   j3_autocomplete(:episode, input_class: 'mdc-text-field')
  #   # => 
  #
  #   j3_autocomplete(:episode, input_class: 'mdc-text-field')
  def j3_autocomplete(field, options = {})
    tag.div({ class: 'dropdown j3_autocomplete' }.merge(options)) do
      j3_autocomplete__input(field, options) + j3_autocomplete__menu
    end
  end

  private

  def j3_autocomplete__menu
    tag.div(j3_autocomplete__search_tag + tag.div(class: 'autocomplete-results'), class: 'dropdown-menu')
  end

  # Render a search input for autocomplete
  def j3_autocomplete__search_tag
    tag.input(type: :text, class: :j3_autocomplete__search, placeholder: I18n.t('j3.autocomplete.search_placeholder')) + tag.div(class: 'dropdown-divider')
  end

  def j3_autocomplete__input(field, options = {})
    hidden_field(field, class: 'j3_autocomplete__input', value: options.delete(:value)) + tag.a(href: '#', 'data-toggle': :dropdown, 'aria-haspopup': true, 'aria-expanded': false) do
      tag.div(class: options.delete(:input_class)) do
        [label(field), tag.div(class: 'j3_autocomplete__label')].join.html_safe
      end
    end
  end
end
