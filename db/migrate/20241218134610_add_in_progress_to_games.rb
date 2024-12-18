class AddInProgressToGames < ActiveRecord::Migration[7.1]
  def change
    add_column :games, :in_progress, :boolean, default: false, null: false
  end
end
