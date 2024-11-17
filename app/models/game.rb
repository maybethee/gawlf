class Game < ApplicationRecord
  has_many :players
  has_many :game_stats, dependent: :destroy
  has_many :users, through: :game_stats

  RANK_CONVERSION = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5,
    '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 10, 'Q': 10, 'K': 0, '*': -2
  }.freeze

  def calculate_scores(hole)
    round_scores = []
    players.all.each do |player|
      scoring_array = player.hand.map do |card|
        # need joker's suit for conversion rather than rank
        card['suit'] == '*' ? card['suit'] : card['rank']
      end

      cancel_equal_columns(scoring_array)
      convert_rank_to_scores!(scoring_array)

      score = scoring_array.sum

      user = player.user

      round_scores << { player_id: player.id, player_name: player.name, user_id: user&.id, round_score: score }
    end
    update_stats(round_scores, hole)
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

  def update_stats(round_scores, hole)
    round_scores.each do |score_data|
      game_stat = GameStat.find_or_initialize_by(
        game_id: id,
        user_id: score_data[:user_id]
      )

      game_stat.round_scores ||= []

      Rails.logger.debug("\n\ngame stat round scores before pushing new score data: #{game_stat.round_scores}")

      # ensure score data only gets pushed once per hole
      game_stat.round_scores << score_data[:round_score] if game_stat.round_scores.length < hole

      Rails.logger.debug("\n\ngame stat round scores after pushing new score data: #{game_stat.round_scores}")

      game_stat.total_score = game_stat.round_scores.sum

      Rails.logger.debug("\n\nupdate stats, game stat: #{game_stat.inspect}")

      game_stat.save!
    end
  end

  def all_round_scores
    stats = GameStat.where(game_id: id).index_by(&:user_id)

    # player_data =
    
    players.includes(:user).map do |player|
      stat = stats[player.user_id]\

      Rails.logger.debug("\n\nall_round_scores, player stats: #{stat.inspect}")

      {
        player_id: player.id,
        player_name: player.name,
        user_id: player.user_id,
        round_scores: stat&.round_scores,
        total_score: stat&.total_score
      }
    end

    # player_data.sort_by { |data| data[:total_score] }

    # Rails.logger.debug("sorted players by score: #{player_data}")

    # player_data
  end

  # # check if this works as expected
  # def rank_by_final_scores
  #   # 1. get all stats belonging to players in game
  #   # 2. sort by total_score low-high
  #   # 3. return ordered data as arr of objs
  #   #
  #   # can i do 2 & 3 at once?
  #   stats = GameStat.where(game_id: id).index_by(&:user_id)

  #   sorted_players = players.includes(:user).sort_by do |player|
  #     stat = stats[player.user_id]

  #     stat&.total_score
  #   end

  #   Rails.logger.debug("\n\nPlayers sorted by total score?: #{sorted_players}")

  #   sorted_players
  # end

  def next_player
    Rails.logger.debug("game's players: #{players.inspect}")
    current_index = players.pluck(:id).index(current_player_id)
    next_index = (current_index + 1) % players.count
    players[next_index]
  end
end
