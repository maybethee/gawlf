# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
Game.destroy_all
Player.destroy_all
User.destroy_all

ActiveRecord::Base.connection.reset_pk_sequence!('games')
ActiveRecord::Base.connection.reset_pk_sequence!('players')
ActiveRecord::Base.connection.reset_pk_sequence!('users')

# user1 = User.new
# user1.email = 'charlie@gmail.com'
# user1.encrypted_password = 'pass'
# user1.save!

# user2 = User.new
# user2.email = 'tofu@gmail.com'
# user2.encrypted_password = 'pass'
# user2.save!

User.create!(email: 'charlie@gmail.com', password: 'password', password_confirmation: 'password')
User.create!(email: 'tofu@gmail.com', password: 'password', password_confirmation: 'password')

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
  hole: 0
)

katy = Player.create!(name: 'Katy', game:, hand: [])
cobb = Player.create!(name: 'Cobb', game:, hand: [])

game.update!(current_player_id: katy.id)
puts 'Seeded game and players'
