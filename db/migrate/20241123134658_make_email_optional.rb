class MakeEmailOptional < ActiveRecord::Migration[7.1]
  def change
    change_column_null :users, :email, true
    remove_index :users, :email # Remove unique index on email
    add_index :users, :email, unique: true, where: 'email IS NOT NULL' # Add partial unique index
  end
end
