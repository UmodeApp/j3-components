require 'test_helper'

class ActsAsRedirectableCreateTest < ActiveSupport::TestCase
  test 'includes module SaveSessionAndRedirect' do
    TestController.included_modules.include?(J3Components::SaveSessionAndRedirect)
  end

  class TestController < ApplicationController
    acts_as_redirectable_create
  end
end
