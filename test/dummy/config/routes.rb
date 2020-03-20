Rails.application.routes.draw do
  resource 'components', only: %i[index create] do
    collection do
      get '/', action: :index
      get 'episodes'
      get 'heroes'
    end
  end
end
