class RemovePreviousPlayerIdFromGames < ActiveRecord::Migration[7.1]
  def change
    remove_column :games, :previous_player_id, :integer
  end
end
