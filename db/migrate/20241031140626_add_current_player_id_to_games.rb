class AddCurrentPlayerIdToGames < ActiveRecord::Migration[7.1]
  def change
    add_column :games, :current_player_id, :bigint
    add_foreign_key :games, :players, column: :current_player_id
  end
end
