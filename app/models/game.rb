class Game < ApplicationRecord
  has_many :players
  has_many :game_stats, dependent: :destroy
  has_many :users, through: :game_stats

  RANK_CONVERSION = {
    'A': 1, '2': 2, '3': 3, '4': 4, '5': 5,
    '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
    'J': 10, 'Q': 10, 'K': 0, '★': -2
  }.freeze

  def calculate_scores(_hole)
    round_scores = []
    players.all.each do |player|
      # Rails.logger.debug("\n\ncalculate scores, working on player: #{player.inspect}")

      scoring_array = player.hand.map do |card|
        { rank: card['rank'].to_sym }
      end

      cancel_equal_columns(scoring_array)
      convert_rank_to_scores!(scoring_array)

      score = scoring_array.sum

      user = player.user

      round_scores << { player_id: player.id, player_name: player.name, user_id: user&.id, round_score: score }
    end
    round_scores
  end

  def cancel_equal_columns(array)
    column_pairs = [[0, 3], [1, 4], [2, 5]]

    column_pairs.each do |pair|
      # ignore column with two jokers
      if array[pair[0]][:rank] == array[pair[1]][:rank] && array[pair[0]][:rank] != :★
        # convert to 'K' for conversion hash compatibility
        array[pair[0]][:rank] = :K
        array[pair[1]][:rank] = :K
      end
      next
    end
  end

  def convert_rank_to_scores!(array)
    array.map! do |card|
      # RANK_CONVERSION.fetch(card[:rank].to_sym)
      RANK_CONVERSION.fetch(card[:rank])
    end
  end

  def update_stats(round_scores, hole)
    # Rails.logger.debug("\n\nPassed round scores: #{round_scores}")

    round_scores.each do |score_data|
      game_stat = GameStat.find_or_initialize_by(
        game_id: id,
        user_id: score_data[:user_id]
      )

      # Rails.logger.debug("GameStat before update: #{game_stat.inspect}")

      game_stat.round_scores ||= []

      # Rails.logger.debug("\n\nupdate stats, game stat: #{game_stat.inspect}")
      # Rails.logger.debug("\n\ngame stat round scores before pushing new score data: #{game_stat.round_scores}")

      # ensure score data only gets pushed once per hole
      game_stat.round_scores << score_data[:round_score] if game_stat.round_scores.length < hole

      game_stat.total_score = game_stat.round_scores.sum

      game_stat.save!

      Rails.logger.debug("GameStat after save: #{game_stat.reload.inspect}")
    end
  end

  def all_round_scores
    stats = GameStat.where(game_id: id).index_by(&:user_id)
    # Rails.logger.debug("Stats retrieved: #{stats.values.map(&:inspect)}")

    players.includes(:user).map do |player|
      stat = stats[player.user_id]
      Rails.logger.debug("Player #{player.name}, User ID: #{player.user_id}, stat: #{stat.inspect}")

      {
        player_id: player.id,
        player_name: player.name,
        user_id: player.user_id,
        round_scores: stat&.round_scores,
        total_score: stat&.total_score
      }
    end
  end

  def update_summary
    stats = GameStat.where(game_id: id).includes(:user).order(total_score: :asc).index_by(&:user_id)

    players_summary = players.map do |player|
      stat = stats[player.user_id]
      {
        user_id: player.user_id,
        player_name: player.name,
        total_score: stat&.total_score,
        round_scores: stat&.round_scores,
        placement: nil
      }
    end

    sorted_summary = players_summary.sort_by { |player| player[:total_score] || Float::INFINITY }
    sorted_summary.each_with_index do |player_summary, index|
      player_summary[:placement] = index + 1
    end

    winner_id = sorted_summary.first[:user_id]

    update!(summary: {
              players: players_summary,
              winner_id:
            })
  end

  def next_player
    # Rails.logger.debug("game's players (ordered by turn_order): #{players.order(:turn_order).inspect}")
    turn_order = self.turn_order

    current_index = turn_order.index(current_player_id)

    Rails.logger.debug("\n\n\n\ncurrent index: #{current_index}")

    next_index = (current_index + 1) % turn_order.size

    Rails.logger.debug("\n\n\n\nnext index is: #{next_index}")

    next_player_id = turn_order[next_index]

    Rails.logger.debug("\n\n\n\nnext player index is: #{next_player_id}")

    Player.find(next_player_id)
  end

  def next_player_id
    # Rails.logger.debug("game's players (ordered by turn_order): #{players.order(:turn_order).inspect}")
    turn_order = self.turn_order

    current_index = turn_order.index(current_player_id)

    # Rails.logger.debug("\n\n\n\ncurrent index: #{current_index}")

    next_index = (current_index + 1) % turn_order.size

    # Rails.logger.debug("\n\n\n\nnext index is: #{next_index}")

    turn_order[next_index]
  end
end
