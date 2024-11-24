class AddSummaryToGames < ActiveRecord::Migration[7.1]
  def change
    add_column :games, :summary, :jsonb, default: {}
  end
end
