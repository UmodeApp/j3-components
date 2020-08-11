# = Autocomplete Helpers
module J3Components
  module Autocomplete
    # Autocomplete with mdc classes
    def j3_mdc_autocomplete(field, options)
      j3_autocomplete(field, { input_container_class: 'mdc-text-field w-100', input_class: 'mdc-text-field__input w-100', label_class: 'mdc-floating-label' }.merge(options))
    end

    ##
    # Render j3 autocomplete component
    #
    # ==== Examples
    #   j3_autocomplete(:episode, input_class: 'mdc-text-field')
    #
    # === Options
    #  * data-url: URL for dropdown items ajax request
    #  * data-datalist: Use a datalist for dropdown items or initial options
    #    when data-url is defined.
    #  * input_container_class: Class for input container for input (dropdown)
    #    and label
    #  * label_class: Class for custom label
    #
    #   j3_autocomplete(:episode, input_class: 'mdc-text-field')
    def j3_autocomplete(field, options = {})
      input_and_menu = j3_autocomplete__input(field, options) + j3_autocomplete__menu(!options[:'data-list'].present?)
      tag.div({ class: %i[dropdown j3_autocomplete].concat(options.delete(:input_container_class) || []).join(' ') }.merge(j3_autocomplete__append_params_to_url(options))) do
        input_and_menu
      end
    end

    private

    # If autocomplete is in a form that was submited, you will need the parent
    # controller action to build the right return_path after create a new
    # record in autocomplete. The parent return_path is passed to parameter as
    # well
    def j3_autocomplete__append_params_to_url(options)
      url = j3_autocomplete__parse_url(options)
      if url.present?
        uri = URI.parse(url)
        uri.query = uri.query.blank? ? '' : "#{uri.query}&"
        # add parent controller action
        uri.query = "#{uri.query}parent_controller_action=#{instance_values['template'].controller.action_name}"
        # check return path
        parent_return_path = instance_values['template'].request.params[:return_path]
        uri.query = "#{uri.query}&parent_return_path=#{CGI.escape(parent_return_path)}" unless parent_return_path.blank?
        options[:'data-url'] = uri.to_s
      end
      options
    end

    def j3_autocomplete__parse_url(options)
      url = options.delete(:'data-url')
      url = options[:data].delete(:url) if url.blank? && options[:data].present?
      url
    end

    def j3_autocomplete__menu(include_search_tag = true)
      tag.div(class: 'dropdown-menu w-100') do
        html = []
        html << j3_autocomplete__search_tag if include_search_tag
        html << tag.div(class: 'autocomplete-results')
        html.join.html_safe
      end
    end

    # Render a search input for autocomplete
    def j3_autocomplete__search_tag
      tag.input(type: :text, class: 'j3_autocomplete__search w-100', placeholder: I18n.t('j3.autocomplete.search_placeholder')) + tag.div(class: 'dropdown-divider')
    end

    def j3_autocomplete__input(field, options = {})
      tag.a(href: '#', 'data-toggle': :dropdown, 'aria-haspopup': true, 'aria-expanded': false, class: "#{object.present? && object.errors[field].any? ? 'mdc-text-field--invalid' : ''} #{options.delete(:input_container_class)}") do
        html = []
        values = options.delete(:value) || object.send(field)
        if options[:multiple].present?
          values = values.split(',') if values.is_a?(String)
          # try to split with comma if value isnt an Array
          if values.nil? || values.empty?
            html << j3_autocomplete__hidden_tag(field, values, true)
          else
            values.each do |value|
              html << j3_autocomplete__hidden_tag(field, value, true)
            end
          end
        else
          html << j3_autocomplete__hidden_tag(field, values)
        end
        html << label(field, class: options.delete(:label_class))
        html << tag.div(class: "j3_autocomplete__label #{options.delete(:input_class)}")
        html.join.html_safe
      end
    end

    J3_AUTOCOMPLETE_HIDDEN_CLASS = 'j3_autocomplete__input'.freeze
    def j3_autocomplete__hidden_tag(field, value, multiple = false)
      tag = hidden_field(field, class: J3_AUTOCOMPLETE_HIDDEN_CLASS, value: value)
      # replace field name to array
      tag = tag.gsub(/ name=\"(.*)\" id/, 'name="\1[]" id') if multiple
      tag
    end
  end
end
