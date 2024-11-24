Rails.application.routes.draw do
  devise_for :users
  mount ActionCable.server => '/cable'
  resources :games do
    resources :players, only: %i[index create]
  end

  resources :users, only: [:show]

  get '/current_user', to: 'sessions#show'
  get '/create_lobby', to: 'lobbies#create'
  post '/join_lobby', to: 'lobbies#join'
  post '/lobby_status', to: 'lobbies#status'
  post '/guest_users', to: 'guest_users#create'

  namespace :api do
    namespace :v1 do
      post '/games/:game_id/draw_card', to: 'games#draw_card'
    end
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get 'up' => 'rails/health#show', as: :rails_health_check

  # Defines the root path route ("/")
  # root "posts#index"
end
