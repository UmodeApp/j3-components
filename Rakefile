begin
  require 'bundler/setup'
rescue LoadError
  puts 'You must `gem install bundler` and `bundle install` to run rake tasks'
end

require 'rdoc/task'

RDoc::Task.new(:rdoc) do |rdoc|
  rdoc.rdoc_dir = 'rdoc'
  rdoc.title    = 'J3Components'
  rdoc.options << '--line-numbers'
  rdoc.rdoc_files.include('README.md')
  rdoc.rdoc_files.include('lib/**/*.rb')
end

require 'bundler/gem_tasks'

require 'rake/testtask'

Rake::TestTask.new(:test) do |t|
  t.libs << 'test'
  t.pattern = 'test/**/*_test.rb'
  t.verbose = false
end

task default: :test

namespace :assets do
  desc "Compile Action View assets"
  task :compile do
    require "blade"
    # require "sprockets"
    # require "sprockets/export"
    Blade.build
  end

  desc "Verify compiled Action View assets"
  task :verify do
    file = "lib/assets/compiled/rails-ujs.js"
    pathname = Pathname.new("#{__dir__}/#{file}")

    print "[verify] #{file} exists "
    if pathname.exist?
      puts "[OK]"
    else
      $stderr.puts "[FAIL]"
      fail
    end

    print "[verify] #{file} is a UMD module "
    if /module\.exports.*define\.amd/m.match?(pathname.read)
      puts "[OK]"
    else
      $stderr.puts "[FAIL]"
      fail
    end

    print "[verify] #{__dir__} can be required as a module "
    js = <<-JS
      window = { Event: class {} }
      class Element {}
      require('#{__dir__}')
    JS
    _, stderr, status = Open3.capture3("node", "--print", js)
    if status.success?
      puts "[OK]"
    else
      $stderr.puts "[FAIL]\n#{stderr}"
      fail
    end
  end
end