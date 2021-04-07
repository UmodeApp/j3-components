# Simple Form input for j3_autocomplete
class J3AutocompleteInput < SimpleForm::Inputs::Base
  attr_accessor :output_buffer
  attr_reader :options

  ##
  # Render j3 autocomplete component
  #
  # ==== Examples
  #   input :episode, as: :j3_autocomplete, html: { input_class: 'mdc-text-field' }
  #
  # === HTML Options
  #  * data-url: URL for dropdown items ajax request
  #  * data-datalist: Use a datalist for dropdown items or initial options
  #    when data-url is defined.
  #  * input_container_class: Class for input container for input (dropdown)
  #    and label
  def input(wrapper_options)
    @options = merge_wrapper_options(input_html_options, wrapper_options)
    input_and_menu = autocomplete_input + menu

    tag.div(input_and_menu, { class: 'dropdown j3_autocomplete' }.merge(append_params_to_url))
  end

  private

  # If autocomplete is in a form that was submited, you will need the parent
  # controller action to build the right return_path after create a new
  # record in autocomplete. The parent return_path is passed to parameter as
  # well
  def append_params_to_url
    url = parse_url
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

  def parse_url
    url = options.delete(:'data-url')
    url = options[:data].delete(:url) if url.blank? && options[:data].present?
    url
  end

  def menu
    tag.div(search_tag + tag.div(class: 'autocomplete-results'), class: 'dropdown-menu w-100', role: :menu, tabindex: 0)
  end

  # Render a search input for autocomplete
  def search_tag
    tag.input(type: :text, class: 'j3_autocomplete__search w-100', placeholder: I18n.t('j3.autocomplete.search_placeholder')) + tag.div(class: 'dropdown-divider')
  end

  def autocomplete_input
    tag.a(href: '#', 'data-toggle': :dropdown, 'aria-haspopup': true, 'aria-expanded': false, class: "#{object.present? && object.errors[attribute_name].any? ? 'mdc-text-field--invalid' : ''} #{options.delete(:input_container_class)}") do
      html = []
      hidden_class = 'j3_autocomplete__input'
      if options[:multiple] && object_value.present?
        multiple_values.each do |value|
          html << @builder.hidden_field(attribute_name, class: hidden_class, value: value, multiple: true)
        end
      else
        html << @builder.hidden_field(attribute_name, class: hidden_class, value: object_value, multiple: options[:multiple])
      end
      html << tag.div(class: "j3_autocomplete__label #{options.delete(:input_class)}")
      html.join.html_safe
    end
  end

  def object_value
    value = options[:value] unless options[:value].nil?
    return nil if !options[:value].nil? && value.blank?

    value = @builder.object.send(attribute_name)&.to_s if @builder.object.present? && @builder.object.respond_to?(attribute_name)
    return nil if value.blank?

    value
  end

  def multiple_values
    # convert csv
    return object_value.split(',') if object_value.is_a?(String)

    object_value
  end
end
