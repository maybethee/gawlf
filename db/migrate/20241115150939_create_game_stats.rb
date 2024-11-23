class CreateGameStats < ActiveRecord::Migration[7.1]
  def change
    create_table :player_game_stats do |t|
      t.references :user, null: false, foreign_key: true
      t.references :game, null: false, foreign_key: true
      t.boolean :won
      t.integer :total_score
      t.jsonb :round_scores, default: []

      t.timestamps
    end
  end
end
