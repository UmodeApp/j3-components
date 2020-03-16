require "j3_components/autocomplete"
require "j3_components/railtie"

module J3Components
  class Gem < Rails::Engine
    config.assets.precompile += %w(j3_components.js) 
  end
end
