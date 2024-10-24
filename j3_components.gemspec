$LOAD_PATH.push File.expand_path('lib', __dir__)
# Maintain your gem's version:
require 'j3_components/version'

Gem::Specification.new do |spec|
  spec.name        = 'j3_components'
  spec.version     = J3Components::VERSION
  spec.authors     = ['Saulo Arruda']
  spec.email       = ['saulo@jumpervb.com.br']
  spec.homepage    = 'http://jumpervb.com.br'
  spec.summary     = 'Utility front-end components'
  spec.description = 'Components for general use such as autocomplete and chips'
  spec.license     = 'MIT'

  spec.files = Dir['{app,config,db,lib}/**/*', 'MIT-LICENSE', 'Rakefile', 'README.md']

  spec.add_dependency 'rails', '>= 5'
  spec.add_dependency 'simple_form'

  spec.add_development_dependency 'blade'
  spec.add_development_dependency 'bootstrap', '~> 4.4.1'
  spec.add_development_dependency 'byebug'
  spec.add_development_dependency 'capybara', '>= 2.15'
  spec.add_development_dependency 'chrome_remote'
  spec.add_development_dependency 'chromedriver-helper'
  spec.add_development_dependency 'client_side_validations'
  spec.add_development_dependency 'client_side_validations-simple_form'
  spec.add_development_dependency 'jasmine'
  spec.add_development_dependency 'jquery-rails'
  spec.add_development_dependency 'mini_racer'
  spec.add_development_dependency 'puma'
  spec.add_development_dependency 'selenium-webdriver'
  spec.add_development_dependency 'sprockets'
  spec.add_development_dependency 'sqlite3'
end
