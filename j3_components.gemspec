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
  spec.description = 'Utility front-end components'
  spec.license     = 'MIT'

  # Prevent pushing this gem to RubyGems.org. To allow pushes either set the 'allowed_push_host'
  # to allow pushing to a single host or delete this section to allow pushing to any host.
  if spec.respond_to?(:metadata)
    # spec.metadata['allowed_push_host'] = 
  else
    raise 'RubyGems 2.0 or newer is required to protect against ' \
      'public gem pushes.'
  end

  # spec.files = Dir['{app,config,db,lib}/**/*', 'MIT-LICENSE', 'Rakefile', 'README.md']
  spec.files      = `git ls-files`.split("\n")

  spec.add_dependency 'rails', '~> 5.2.3'

  spec.add_development_dependency 'blade'
  spec.add_development_dependency 'bootstrap', '~> 4.4.1'
  spec.add_development_dependency 'byebug' #, platforms: [:mri, :mingw, :x64_mingw]
  spec.add_development_dependency 'capybara', '>= 2.15'
  spec.add_development_dependency 'chromedriver-helper'
  spec.add_development_dependency 'jquery-rails'
  spec.add_development_dependency 'puma'
  spec.add_development_dependency 'selenium-webdriver'
  spec.add_development_dependency 'sprockets'
  spec.add_development_dependency 'sqlite3'
end
