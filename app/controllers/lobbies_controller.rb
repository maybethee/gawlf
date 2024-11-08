class LobbiesController < ApplicationController
  def create
    game = Game.create!(
      lobby_code: generate_unique_code,
      lobby_created_at: Time.current,
      game_state: initial_game_state,
      turn: 1
    )

    render json: { message: 'Lobby created', game_id: game.id, lobby_code: game.lobby_code }
  end

  def join
    game = Game.find_by(lobby_code: params[:lobby_code])

    Rails.logger.debug("passed lobby code: #{params[:lobby_code]}")
    Rails.logger.debug("found game: #{game.inspect}")

    if game && game.status == 'waiting'
      render json: { message: 'Joined lobby', game_id: game.id }
    else
      render json: { error: 'Lobby not found or already started' }, status: :not_found
    end
  end

  def status
    game = Game.find_by(lobby_code: params[:lobby_code])
    render json: { status: game.status }
  end

  def update_status
    game = Game.find_by(lobby_code: params[:lobby_code])
    game.update
  end

  private

  def generate_unique_code
    SecureRandom.hex(3)
  end

  def initial_game_state
    {
      deck: [].tap do |cards|
        %w[♠︎ ♣︎ ♥︎ ♦︎].each do |suit|
          %w[A 2 3 4 5 6 7 8 9 10 J Q K].each do |rank|
            cards << { suit:, rank:, visibility: 'hidden' }
          end
        end
        2.times { cards << { suit: '*', rank: '*', visibility: 'hidden'} }
      end,
      discard_pile: [],
      drawn_card: {}
    }
  end
end
