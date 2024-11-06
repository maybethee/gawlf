class Game < ApplicationRecord
  has_many :players

  def next_player
    Rails.logger.debug("game's players: #{players.inspect}")
    current_index = players.pluck(:id).index(current_player_id)
    next_index = (current_index + 1) % players.count
    players[next_index]
  end
end
