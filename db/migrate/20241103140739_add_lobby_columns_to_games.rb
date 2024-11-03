class AddLobbyColumnsToGames < ActiveRecord::Migration[7.1]
  def change
    add_column :games, :status, :string, default: 'waiting'
    add_column :games, :lobby_code, :string
    add_column :games, :lobby_created_at, :datetime
  end
end
