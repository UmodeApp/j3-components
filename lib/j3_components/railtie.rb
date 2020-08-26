module J3Components
  class Railtie < ::Rails::Railtie
  end

  class ActionView::Helpers::FormBuilder
    include ActionView::Helpers::TagHelper
    attr_accessor :output_buffer
    include ::J3Components::Autocomplete
  end
end
