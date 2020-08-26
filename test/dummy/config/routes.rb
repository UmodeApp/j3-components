Rails.application.routes.draw do
  resource 'components', only: %i[index create] do
    collection do
      get '/', action: :index
      get 'simple_form'
      get 'episodes'
      get 'heroes'
      get 'multiple'
    end
  end
end
