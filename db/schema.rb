# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.1].define(version: 2025_03_30_193351) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "game_stats", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "game_id", null: false
    t.boolean "won"
    t.integer "total_score"
    t.jsonb "round_scores", default: []
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["game_id"], name: "index_game_stats_on_game_id"
    t.index ["user_id"], name: "index_game_stats_on_user_id"
  end

  create_table "games", force: :cascade do |t|
    t.jsonb "game_state"
    t.integer "hole"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "current_player_id"
    t.string "status", default: "waiting"
    t.string "lobby_code"
    t.datetime "lobby_created_at"
    t.string "the_day_that"
    t.jsonb "summary", default: {}
    t.boolean "in_progress", default: false, null: false
    t.jsonb "turn_order", default: []
    t.integer "creator_id"
  end

  create_table "players", force: :cascade do |t|
    t.string "name"
    t.bigint "game_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.jsonb "hand", default: [], null: false
    t.bigint "user_id"
    t.index ["game_id"], name: "index_players_on_game_id"
    t.index ["user_id"], name: "index_players_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: ""
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "username"
    t.boolean "guest", default: false
    t.jsonb "user_config", default: {}
    t.index ["email"], name: "index_users_on_email", unique: true, where: "(email IS NOT NULL)"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["username"], name: "index_users_on_username", unique: true
  end

  add_foreign_key "game_stats", "games"
  add_foreign_key "game_stats", "users"
  add_foreign_key "games", "players", column: "current_player_id"
  add_foreign_key "players", "games"
  add_foreign_key "players", "users"
end
