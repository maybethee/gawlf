class AddCreatorIdToGames < ActiveRecord::Migration[7.1]
  def change
    add_column :games, :creator_id, :integer
  end
end
