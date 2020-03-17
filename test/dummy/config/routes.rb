Rails.application.routes.draw do
  get 'components', to: 'j3/components#index'
  get 'episodes', to: 'j3/components#episodes'
  get 'heroes', to: 'j3/components#heroes'
end
