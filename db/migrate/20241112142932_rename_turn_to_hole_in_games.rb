class RenameTurnToHoleInGames < ActiveRecord::Migration[7.1]
  def change
    rename_column :games, :turn, :hole
  end
end
