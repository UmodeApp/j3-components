module J3Components
  # Controller concern to save session before redirect from an autocomplete new button in dropdown menu
  module SaveSessionAndRedirect
    extend ActiveSupport::Concern

    included do
      around_action :save_session_and_redirect, only: %i[new create edit update]
      helper_method :params
    end

    protected

    def saved_redirect_to(path_to_redirect, record)
      append_params = { redirected_id: record.id, redirected_type: record.model_name } if record.present?
      return_path = return_path(append_params)
      redirect_to return_path.blank? ? path_to_redirect : return_path
    end

    def return_path(append_params = nil)
      return_path = params[:return_path].blank? ? @return_path : params[:return_path]
      if return_path.present? && append_params.present?
        separator = return_path.include?('?') ? '&' : '?'
        return_path = "#{return_path}#{separator}#{append_params.to_query}"
      end
      return_path
    end

    def save_session_and_redirect
      session[:j3_autocomplete__session] ||= {}
      if params[:j3_autocomplete__redirect].present?
        session[:j3_autocomplete__session][controller_name] = params
        redirect_to params[:j3_autocomplete__redirect]
      else
        if session[:j3_autocomplete__session][controller_name].present?
          old_params = params.permit!.to_h
          new_params = session[:j3_autocomplete__session].delete(controller_name) 
          convert_redirected_param(old_params, new_params)
          @params = ActionController::Parameters.new new_params
        end
        yield
      end
    end

    def convert_redirected_param(old_params, new_params)
      return unless old_params[:redirected_type].present?

      attribute_name = old_params[:redirected_type].underscore + '_id'
      new_params[controller_name.singularize][attribute_name] = old_params[:redirected_id] if new_params[controller_name.singularize].present?
    end

    def params
      @params.present? ? @params : super
    end
  end
end
