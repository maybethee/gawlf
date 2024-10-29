# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
Player.delete_all
Game.delete_all

ActiveRecord::Base.connection.reset_pk_sequence!('games')
ActiveRecord::Base.connection.reset_pk_sequence!('players')

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
    drawn_card: '',
  },
  turn: 1
)

Player.create!(name: 'Katy', game:)
Player.create!(name: 'Cobb', game:)

puts 'Seeded game and players'
