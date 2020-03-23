require 'test_helper'

class ActsAsRedirectableCreateTest < ActiveSupport::TestCase
  test 'includes module SaveSessionAndRedirect' do
    assert_equal 'dummy', TestController.new.dummy, 'preserves ApplicationController methods'
    assert TestController.included_modules.include?(J3Components::SaveSessionAndRedirect), 'include module'
  end

  class TestController < ApplicationController
    acts_as_redirectable_create
  end
end
