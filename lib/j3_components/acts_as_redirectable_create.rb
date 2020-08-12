module ::J3Components
  module ActsAsRedirectableCreate
    # Enable save session and redirect behavior in controller
    def acts_as_redirectable_create(_options = {})
      include ::J3Components::SaveSessionAndRedirect
    end
  end
end

ActionController::Base.extend ::J3Components::ActsAsRedirectableCreate
