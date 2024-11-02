class LobbiesController < ApplicationController
  def create_lobby
    game = Game.create!(
      game_state: {
        deck: [].tap do |cards|
          %w[♠︎ ♣︎ ♥︎ ♦︎].each do |suit|
            %w[A 2 3 4 5 6 7 8 9 10 J Q K].each do |rank|
              cards << { suit:, rank: }
            end
          end
          2.times { cards << { suit: '*', rank: '*' } }
        end,
        discard_pile: [],
        drawn_card: {}
      },
      turn: 1
    )

    render json: { message: 'game created', game_id: game.id }
  end
end
