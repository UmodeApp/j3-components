# Simple Form input for j3_autocomplete
class J3AutocompleteInput < SimpleForm::Inputs::Base
  attr_accessor :output_buffer

  # input method
  def input(wrapper_options)
    merged_input_options = merge_wrapper_options(input_html_options, wrapper_options)
    j3_autocomplete(attribute_name, merged_input_options)
  end

  protected

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
    input_and_menu = j3_autocomplete__input(field, options) + j3_autocomplete__menu

    tag.div({ class: 'dropdown j3_autocomplete' }.merge(j3_autocomplete__append_params_to_url(options))) do
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
      uri.query = "#{uri.query}parent_controller_action=#{@builder.template.controller.action_name}"
      # check return path
      parent_return_path = @builder.template.request.params[:return_path]
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

  def j3_autocomplete__menu
    tag.div(j3_autocomplete__search_tag + tag.div(class: 'autocomplete-results'), class: 'dropdown-menu w-100', role: :menu, tabindex: 0)
  end

  # Render a search input for autocomplete
  def j3_autocomplete__search_tag
    tag.input(type: :text, class: 'j3_autocomplete__search w-100', placeholder: I18n.t('j3.autocomplete.search_placeholder')) + tag.div(class: 'dropdown-divider')
  end

  def j3_autocomplete__input(field, options = {})
    tag.a(href: '#', 'data-toggle': :dropdown, 'aria-haspopup': true, 'aria-expanded': false, class: "#{object.present? && object.errors[field].any? ? 'mdc-text-field--invalid' : ''} #{options.delete(:input_container_class)}") do
      html = []
      hidden_class = 'j3_autocomplete__input'
      if options[:multiple] && options[:value].present?
        multiple_values(options).each do |value|
          html << @builder.hidden_field(field, class: hidden_class, value: value, multiple: true)
        end
      else
        html << @builder.hidden_field(field, class: hidden_class, value: options[:value], multiple: options[:multiple])
      end
      html << tag.div(class: "j3_autocomplete__label #{options.delete(:input_class)}")
      html.join.html_safe
    end
  end

  def multiple_values(options)
    # convert csv
    return options[:value].split(',') if options[:value].is_a?(String)
  end
end
