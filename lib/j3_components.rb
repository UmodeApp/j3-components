require 'simple_form'
require 'j3_components/autocomplete'
require 'j3_components/railtie'
require 'j3_components/acts_as_redirectable_create'
require 'j3_components/save_session_and_redirect'
require 'j3_components/inputs/j3_autocomplete_input'

module J3Components
  class Gem < Rails::Engine
    config.assets.precompile += %w(j3_components.js j3_components.sass)
  end
end
