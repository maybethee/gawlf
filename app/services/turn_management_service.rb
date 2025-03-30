class TurnManagementService
  def initialize(game, player, next_player)
    @game = game
    @player = player
    @next_player = next_player
  end

  def handle_turn_transition
    curr_round_scores, all_round_scores, summary_update = check_round_game_end

    update_turn

    [curr_round_scores, all_round_scores, summary_update]
  end

  def update_turn
    @game.update!(current_player_id: @next_player.id)
  end

  private

  def check_round_game_end
    return [nil, nil, nil] unless all_revealed?(@player.hand)

    curr_round_scores = @game.calculate_scores(@game.hole)

    @game.update_stats(curr_round_scores, @game.hole)

    all_round_scores = @game.all_round_scores
    summary_update = @game.update_summary if @game.hole == 9

    [curr_round_scores, all_round_scores, summary_update]
  end

  def all_revealed?(hand)
    hand.all? { |card| card['visibility'] == 'revealed' }
  end
end
