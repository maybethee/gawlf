class AddPreviousPlayerIdToGames < ActiveRecord::Migration[7.1]
  def change
    add_column :games, :previous_player_id, :integer
  end
end
