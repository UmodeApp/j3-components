module J3Components
  module ActsAsRedirectableCreate
    extend ActiveSupport::Concern
    class_methods do
      # Enable save session and redirect behavior in controller
      def acts_as_redirectable_create(_options = {})
        include J3Components::SaveSessionAndRedirect
      end
    end
  end
end

class ApplicationController < ActionController::Base
  include J3Components::ActsAsRedirectableCreate
end