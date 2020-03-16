require 'test_helper'
require 'selenium/webdriver'
require 'chromedriver-helper'

class ApplicationSystemTestCase < ActionDispatch::SystemTestCase
  # driven_by :poltergeist
  driven_by :selenium, using: :firefox
end