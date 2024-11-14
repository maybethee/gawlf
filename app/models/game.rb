class Game < ApplicationRecord
  has_many :players

  RANK_CONVERSION = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5,
    '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 10, 'Q': 10, 'K': 0, '*': -2
  }.freeze

  def calculate_scores
    round_scores = []
    players.all.each do |player|
      scoring_array = player.hand.map do |card|
        # need joker's suit for conversion rather than rank
        if card['suit'] == '*'
          card['suit']
        else
          card['rank']
        end
      end

      cancel_equal_columns(scoring_array)

      convert_rank_to_scores!(scoring_array)

      score = scoring_array.sum
      round_scores << { player_id: player.id, player_name: player.name, round_score: score }
    end
    round_scores
  end

  def cancel_equal_columns(array)
    column_pairs = [[0, 3], [1, 4], [2, 5]]

    column_pairs.each do |pair|
      # ignore column with two jokers
      if array[pair[0]] == array[pair[1]] && array[pair[0]]['suit'] != '*'
        # convert to 'K' for conversion hash compatibility
        array[pair[0]] = 'K'
        array[pair[1]] = 'K'
      end
      next
    end
  end

  def convert_rank_to_scores!(array)
    array.map! do |score|
      RANK_CONVERSION.fetch(score.to_sym)
    end
  end

  def next_player
    Rails.logger.debug("game's players: #{players.inspect}")
    current_index = players.pluck(:id).index(current_player_id)
    next_index = (current_index + 1) % players.count
    players[next_index]
  end
end
